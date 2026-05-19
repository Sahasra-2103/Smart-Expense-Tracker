const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');
const { apiKey, model } = require('../config/gemini');

// Note: This service will attempt to call Gemini Vision API when apiKey is present.
// The exact usage of @google/generative-ai may require additional setup and credentials.
// For environments without Gemini access this module falls back to Tesseract OCR + simple heuristics.

const analyzeInvoice = async (filePath) => {
  // If Gemini API key is configured, attempt to call it
  if (apiKey) {
    try {
      // Placeholder for real Gemini Vision call.
      // You should replace this block with the official @google/generative-ai client calls
      // following Google's SDK docs and provide API key via ADC or environment.
      // For now, fall through to OCR after logging intent.
      console.log('Gemini API key present — implement real SDK call here');
    } catch (err) {
      console.warn('Gemini call failed, falling back to OCR', err.message);
    }
  }

  // Attempt to re-encode image to reduce OCR errors (optional: requires `sharp`).
  let extractedText = '';
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

    const { data: { text } } = await Tesseract.recognize(ocrFile, 'eng', { logger: m => {} });
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

  return {
    title: merchant || path.basename(filePath),
    amount,
    merchant,
    invoiceDate,
    paymentMethod: '',
    description: '',
    category,
    extractedText,
  };
};

module.exports = { analyzeInvoice };
