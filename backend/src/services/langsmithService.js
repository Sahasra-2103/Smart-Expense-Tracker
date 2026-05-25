const fetch = global.fetch || require('node-fetch');
const { URL } = require('url');

const endpoint = process.env.LANGSMITH_ENDPOINT || process.env.LANGCHAIN_ENDPOINT || '';
const apiKey = process.env.LANGSMITH_API_KEY || process.env.LANGCHAIN_API_KEY || '';
const project = (process.env.LANGSMITH_PROJECT || '').replace(/"/g, '') || undefined;
const enabled = (process.env.LANGSMITH_TRACING || '').toLowerCase() === 'true' && endpoint && apiKey;

async function trackEvent(name, payload = {}) {
  if (!enabled) return;
  try {
    const url = new URL('/v1/runs', endpoint).toString();
    const body = {
      project: project || undefined,
      name,
      payload,
      ts: new Date().toISOString(),
    };

    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch (err) {
    console.warn('LangSmith tracking failed:', err && err.message ? err.message : err);
  }
}

module.exports = { trackEvent, enabled };
