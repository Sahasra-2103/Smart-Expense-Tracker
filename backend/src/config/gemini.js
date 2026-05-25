module.exports = {
  model: process.env.GEMINI_MODEL || 'gemini-vision-preview',
  apiKey: process.env.GEMINI_API_KEY || '',
  grokModel: process.env.GROQ_MODEL || process.env.GROK_MODEL || 'llama-3.3-70b-versatile',
  grokVisionModel: process.env.GROQ_VISION_MODEL || process.env.GROK_VISION_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct',
  grokApiKey: process.env.GROQ_API_KEY || process.env.GROK_API_KEY || '',
};
