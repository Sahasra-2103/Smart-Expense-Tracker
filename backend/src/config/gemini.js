module.exports = {
  model: process.env.GEMINI_MODEL || 'gemini-vision-preview',
  apiKey: process.env.GEMINI_API_KEY || '',
  grokModel: process.env.GROK_MODEL || 'grok-1',
  grokApiKey: process.env.GROK_API_KEY || '',
};
