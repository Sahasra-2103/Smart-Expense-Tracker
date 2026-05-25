const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const yaml = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const analyticsRoutes = require('./routes/analytics');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// If the app runs behind a proxy (dev or production), enable trust proxy
// so middleware like express-rate-limit can correctly read X-Forwarded-* headers.
// Restrict trusted proxies to loopback addresses to avoid permissive settings
// which can allow IP spoofing; this satisfies express-rate-limit validation.
app.set('trust proxy', 'loopback');

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOADS_DIR || 'uploads')));

// Diagnostics Route
app.get('/api/diagnose', (req, res) => {
  const key = process.env.GROK_API_KEY || '';
  res.json({
    isVercel: !!(process.env.VERCEL === '1' || process.env.VERCEL),
    hasGrokApiKey: !!key,
    grokApiKeyLength: key.length,
    grokApiKeyPrefix: key ? key.substring(0, 8) : 'none',
    envKeys: Object.keys(process.env).filter(k => !k.includes('KEY') && !k.includes('PASSWORD') && !k.includes('SECRET') && !k.includes('URI')),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/analytics', analyticsRoutes);

// Swagger
try {
  const swaggerDocument = yaml.load(path.join(__dirname, '..', 'swagger.yaml'));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (err) {
  console.warn('Swagger not available', err.message);
}

app.get('/', (req, res) => res.json({ ok: true, message: 'Smart Expense Tracker API' }));

app.use(errorHandler);

module.exports = app;
