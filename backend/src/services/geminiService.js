const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');
const { apiKey, model, grokApiKey, grokModel } = require('../config/gemini');
const langsmith = require('./langsmithService');

// Note: This service can use Grok via GROK_API_KEY when present.
// It still falls back to Tesseract OCR + heuristics when AI parsing is unavailable.

const extractJsonFromText = (content) => {
  const match = content.match(/\{[\s\S]*\}/m);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch (err) {
    return null;
  }
};

const parseInvoiceWithGrok = async (invoiceText) => {
  if (!grokApiKey || !invoiceText) return null;

  const prompt = `Extract the following fields from this invoice text as a JSON object with keys: merchant, amount, date, category, description. Return only valid JSON.\n\nInvoice text:\n${invoiceText}`;

  const isGroq = grokApiKey.startsWith('gsk_');
  const apiUrl = isGroq ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';
  const modelToUse = isGroq ? 'llama-3.3-70b-versatile' : grokModel;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${grokApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelToUse,
      messages: [
        { role: 'system', content: 'You are an invoice parser. Extract merchant, amount, date, category, and description from raw invoice text.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.0,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq/Grok request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  const parsed = extractJsonFromText(content);
  if (!parsed) return null;

  const amountValue = parsed.amount || parsed.total || parsed.totalAmount || parsed['total amount'];
  const amount = amountValue ? parseFloat(String(amountValue).replace(/[^0-9.-]+/g, '')) : null;
  const dateValue = parsed.date || parsed.invoiceDate || parsed.transactionDate;
  const invoiceDate = dateValue ? new Date(String(dateValue)) : null;

  return {
    merchant: parsed.merchant || parsed.vendor || parsed.supplier,
    amount: Number.isFinite(amount) ? amount : null,
    invoiceDate: invoiceDate instanceof Date && !isNaN(invoiceDate.getTime()) ? invoiceDate : null,
    category: parsed.category,
    description: parsed.description,
  };
};

const analyzeInvoice = async (filePath) => {
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL;
  console.log('analyzeInvoice starting:', {
    filePath,
    isVercel,
    hasGrokApiKey: !!grokApiKey,
    grokApiKeyPrefix: grokApiKey ? grokApiKey.substring(0, 8) : 'none',
  });

  // If Gemini API key is configured, attempt to call it
  if (apiKey) {
    try {
      console.log('Gemini API key present — implement real SDK call here');
    } catch (err) {
      console.warn('Gemini call failed, falling back to OCR', err.message);
    }
  }

  // Fast path for Groq Vision API on Vercel to bypass slow Tesseract OCR
  if (grokApiKey && grokApiKey.startsWith('gsk_')) {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
      try {
        const base64Image = fs.readFileSync(filePath, { encoding: 'base64' });
        const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
        const prompt = 'Extract the following fields from this invoice as a JSON object with keys: merchant, amount, date, category, description. Return only valid JSON. If you cannot find a value, use null.';
        
        console.log('Sending request to Groq Vision API...');
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${grokApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.2-11b-vision-preview',
            messages: [
              { 
                role: 'user', 
                content: [
                  { type: 'text', text: prompt },
                  { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } }
                ]
              }
            ],
            temperature: 0.0,
            max_tokens: 500,
          }),
        });

        console.log('Groq Vision response status:', response.status, response.statusText);
        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content || '';
          const parsed = extractJsonFromText(content);
          if (parsed) {
            const amountValue = parsed.amount || parsed.total || parsed.totalAmount || parsed['total amount'];
            const amount = amountValue ? parseFloat(String(amountValue).replace(/[^0-9.-]+/g, '')) : null;
            const dateValue = parsed.date || parsed.invoiceDate || parsed.transactionDate;
            const invoiceDate = dateValue ? new Date(String(dateValue)) : null;
            
            return {
              title: parsed.merchant || parsed.vendor || parsed.supplier || path.basename(filePath),
              amount: Number.isFinite(amount) ? amount : 0,
              merchant: parsed.merchant || parsed.vendor || parsed.supplier || '',
              invoiceDate: invoiceDate instanceof Date && !isNaN(invoiceDate.getTime()) ? invoiceDate : new Date(),
              paymentMethod: '',
              description: parsed.description || '',
              category: parsed.category || 'Other',
              extractedText: 'Parsed via Groq Vision (OCR bypassed)',
            };
          } else {
            console.warn('Could not extract JSON from Groq content:', content);
          }
        } else {
          const errText = await response.text().catch(() => '');
          console.error('Groq Vision API returned error response:', errText);
        }
      } catch (err) {
        console.warn('Groq Vision fast path failed:', err.message);
      }
    } else {
      console.log('Skipping Groq Vision: file extension is not an image:', ext);
    }
  } else {
    console.log('Skipping Groq Vision: no GROK_API_KEY found or it does not start with gsk_');
  }

  // If on Vercel, block falling back to Tesseract OCR to prevent 10s Serverless Timeout
  if (isVercel) {
    console.error('OCR fallback blocked on Vercel to prevent Serverless Timeout');
    throw new Error('Invoice processing failed: OCR fallback is not supported in the serverless environment. Please ensure you upload a PNG/JPEG image and GROK_API_KEY is configured correctly.');
  }

  // Attempt to re-encode image to reduce OCR errors (optional: requires `sharp`).
  let extractedText = '';
  let description = '';
  let ocrFile = filePath;
  try {
    let sharpLib = null;
    try {
      sharpLib = require('sharp');
    } catch (e) {
      sharpLib = null;
    }

    if (sharpLib) {
      try {
        const buf = fs.readFileSync(filePath);
        const pngBuf = await sharpLib(buf).png().toBuffer();
        const tmpPath = `${filePath}.png`;
        fs.writeFileSync(tmpPath, pngBuf);
        ocrFile = tmpPath;
      } catch (reErr) {
        console.warn('Image re-encode failed:', reErr && reErr.message ? reErr.message : reErr);
      }
    }

    const { data: { text } } = await Tesseract.recognize(ocrFile, 'eng', { 
      logger: m => {},
      cachePath: isVercel ? '/tmp' : '.'
    });
    extractedText = text || '';
  } catch (ocrErr) {
    console.warn('Tesseract OCR failed:', ocrErr && ocrErr.message ? ocrErr.message : ocrErr);
    extractedText = '';
  } finally {
    // cleanup temporary re-encoded file if present
    if (ocrFile !== filePath) {
      try { fs.unlinkSync(ocrFile); } catch (e) { /* ignore */ }
    }
  }

  // Heuristics to find amount and date
  // Match currency symbols like ₹, Rs, INR, $ and numbers with commas and optional cents
  const amountRegex = /(?:₹|rs\.?|inr|\$)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/gi;
  const amountMatches = [];
  let m;
  while ((m = amountRegex.exec(extractedText)) !== null) {
    // ignore lone year-like numbers (e.g., 2026) by requiring reasonable length
    const raw = m[1].replace(/,/g, '');
    const num = parseFloat(raw);
    if (!isNaN(num) && num > 0 && num < 10000000) amountMatches.push(num);
  }
  const amount = amountMatches.length ? Math.max(...amountMatches) : 0;

  // Send tracking event to LangSmith if enabled
  try {
    const eventPayload = {
      file: path.basename(filePath),
      usedGemini: !!apiKey,
      ocrTextLength: extractedText.length,
      amountCandidates: amountMatches,
      chosenAmount: amount,
      categoryScores: scores,
      chosenCategory: category,
    };
    langsmith.trackEvent('analyzeInvoice', eventPayload);
  } catch (e) {
    // ignore
  }

  const dateMatch = extractedText.match(/(\d{4}-\d{2}-\d{2})|(\d{2}\/\d{2}\/\d{4})|(\d{1,2} \w+ \d{4})/);
  let invoiceDate = dateMatch ? new Date(dateMatch[0]) : new Date();
  if (isNaN(invoiceDate.getTime())) invoiceDate = new Date();

  // Merchant detection: choose first non-empty line that doesn't look like an amount or date
  const lines = extractedText.split('\n').map(l => l.trim()).filter(Boolean);
  let merchant = '';
  for (const line of lines) {
    if (/[₹$0-9]/.test(line) && /\d/.test(line) && line.length < 6) continue; // skip small numeric lines
    if (/\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}/.test(line)) continue;
    if (amountRegex.test(line)) continue;
    merchant = line; break;
  }

  // Category detection with keyword scoring to avoid defaulting to Other.
  const txt = extractedText.toLowerCase();
  const categoryKeywords = {
    Food: [
      'restaurant', 'cafe', 'pizza', 'food', 'dinner', 'lunch', 'canteen', 'biryani', 'curry',
      'meal', 'burger', 'sandwich', 'coffee', 'chai', 'snacks', 'breakfast', 'dinner', 'dessert',
    ],
    Travel: [
      'uber', 'ola', 'taxi', 'lyft', 'flight', 'train', 'bus', 'travel', 'airbnb', 'booking',
      'ticket', 'hotel', 'rail', 'metro', 'cab', 'fare', 'bus fare', 'flight ticket', 'boarding pass',
    ],
    Shopping: [
      'amazon', 'ebay', 'flipkart', 'myntra', 'order', 'purchase', 'shop', 'shopping', 'mall',
      'store', 'cart', 'payment for', 'shipment', 'delivery', 'invoice',
    ],
    Bills: [
      'electricity', 'water bill', 'gas bill', 'utility', 'utility bill', 'payment due', 'bill payment',
      'mobile recharge', 'phone bill', 'broadband', 'internet', 'subscription', 'dth', 'electric',
      'gas', 'tax', 'bill', 'due amount', 'statement',
    ],
    Entertainment: [
      'movie', 'netflix', 'spotify', 'ticket', 'concert', 'subscription', 'play', 'event', 'show',
    ],
    Health: [
      'pharmacy', 'clinic', 'hospital', 'doctor', 'medicine', 'medicines', 'health', 'lab', 'diagnostic',
      'doctor fee', 'consultation', 'medical', 'ambulance',
    ],
    Education: [
      'school', 'tuition', 'course', 'university', 'college', 'training', 'exam fee', 'coaching',
      'certificate', 'library', 'education',
    ],
  };
  const scores = {};
  Object.entries(categoryKeywords).forEach(([categoryName, keywords]) => {
    scores[categoryName] = 0;
    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = txt.match(regex);
      scores[categoryName] += matches ? matches.length : 0;
    });
  });

  let category = 'Other';
  const bestCategory = Object.entries(scores).reduce((best, [name, score]) => {
    if (score > best.score) return { name, score };
    return best;
  }, { name: 'Other', score: 0 });
  if (bestCategory.score > 0) category = bestCategory.name;

  // If no strong keyword was found, look for explicit bill/food markers.
  if (category === 'Other') {
    if (/(bill|due|payment)/i.test(txt)) category = 'Bills';
    else if (/(restaurant|cafe|food|meal|dinner|lunch|breakfast)/i.test(txt)) category = 'Food';
    else if (/(taxi|uber|ola|flight|train|bus|hotel|booking|cab)/i.test(txt)) category = 'Travel';
  }

  if (grokApiKey && extractedText) {
    try {
      const grokData = await parseInvoiceWithGrok(extractedText);
      if (grokData) {
        if (grokData.amount && grokData.amount > 0) amount = grokData.amount;
        if (grokData.invoiceDate) invoiceDate = grokData.invoiceDate;
        merchant = grokData.merchant || merchant;
        category = grokData.category || category;
        description = grokData.description || description;
      }
    } catch (err) {
      console.warn('Grok parse failed:', err && err.message ? err.message : err);
    }
  }

  return {
    title: merchant || path.basename(filePath),
    amount,
    merchant,
    invoiceDate,
    paymentMethod: '',
    description,
    category,
    extractedText,
  };
};

module.exports = { analyzeInvoice };
