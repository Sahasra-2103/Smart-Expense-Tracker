const app = require('../backend/src/app');
const connectDB = require('../backend/src/config/db');

module.exports = async (req, res) => {
  // Directly handle diagnostics endpoint to bypass Express routing on Vercel
  if (req.url === '/api/diagnose' || req.url.startsWith('/api/diagnose?')) {
    const key = process.env.GROK_API_KEY || '';
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      isVercel: true,
      hasGrokApiKey: !!key,
      grokApiKeyLength: key.length,
      grokApiKeyPrefix: key ? key.substring(0, 8) : 'none',
      envKeys: Object.keys(process.env).filter(k => !k.includes('KEY') && !k.includes('PASSWORD') && !k.includes('SECRET') && !k.includes('URI')),
    }));
    return;
  }

  await connectDB();
  return app(req, res);
};
