# Smart Expense Tracker - Backend

Setup:

1. Copy `.env.example` to `.env` and configure `MONGO_URI` and `JWT_SECRET` and optional `GEMINI_API_KEY`.
2. Install dependencies:

```bash
cd backend
npm install
```

3. Run in development:

```bash
npm run dev
```

Notes:
- `src/services/geminiService.js` contains a fallback OCR-based implementation using `tesseract.js`.
- Replace the placeholder Gemini code with the official `@google/generative-ai` usage and set `GEMINI_API_KEY`.
