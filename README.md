# Smart Expense Tracker

A MERN-based expense tracking application with AI-powered image recognition for receipt scanning.

## Project Structure

```
Tracker/
├── backend/          # Express.js + MongoDB backend
│   ├── src/
│   │   ├── server.js
│   │   ├── app.js
│   │   ├── config/   # Database configuration
│   │   ├── routes/   # API routes
│   │   ├── models/   # Mongoose models
│   │   ├── services/ # Business logic
│   │   └── utils/    # Utilities including bootstrap.js
│   └── package.json
└── frontend/         # React application (created by npm run setup)
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── context/
    │   └── hooks/
    └── package.json
```

## Quick Start

### Prerequisites

- Node.js (v14+)
- MongoDB instance (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/expense_tracker
   JWT_SECRET=your-secret-key
   GEMINI_API_KEY=your-gemini-api-key
   ```

5. Start the backend:
   ```bash
   npm run dev
   ```

   Backend will run on `http://localhost:5000`

### Frontend Setup

1. Create frontend scaffold (from backend directory):
   ```bash
   npm run setup
   ```

2. Navigate to frontend directory:
   ```bash
   cd ../frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the frontend:
   ```bash
   npm start
   ```

   Frontend will run on `http://localhost:3000`

## API Documentation

API documentation is available at: `http://localhost:5000/api/docs`

## Features

- ✅ User authentication (JWT)
- ✅ Expense management (CRUD operations)
- ✅ Receipt image scanning with OCR
- ✅ AI-powered expense categorization
- ✅ Analytics and insights
- ✅ Rate limiting and security headers
- ✅ API documentation with Swagger

## Environment Variables

### Backend (.env)

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRE` - JWT expiration time
- `GEMINI_API_KEY` - Google Gemini API key
- `UPLOADS_DIR` - Directory for uploaded files
- `NODE_ENV` - Environment (development/production)

## Development

### Backend Commands

```bash
npm run dev      # Start with nodemon (auto-reload)
npm start        # Start production server
npm run setup    # Create frontend scaffold
```

### Frontend Commands

```bash
npm start        # Start development server
npm run build    # Build for production
npm test         # Run tests
```

### Image-only upload workflow

- The frontend accepts only a receipt/invoice image as input. Upload the image from the dashboard and the backend will extract amounts, dates and categories automatically using OCR and simple AI heuristics. The dashboard will then display totals grouped by category (Food, Travel, Shopping, Bills, etc.).

Note: For local development ensure the backend is running on `http://localhost:5000` so the frontend proxy can reach the API.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/:id` - Get expense details
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Analytics
- `GET /api/analytics/summary` - Get expense summary
- `GET /api/analytics/categories` - Get category breakdown
- `GET /api/analytics/trends` - Get spending trends

## Technologies

### Backend
- Express.js - Web framework
- MongoDB - Database
- Mongoose - ODM
- JWT - Authentication
- Google Generative AI - Receipt analysis
- Tesseract.js - OCR

### Frontend
- React 18 - UI library
- React Router - Navigation
- Axios - HTTP client
- Date-fns - Date utilities

## Contributing

1. Create a feature branch
2. Make your changes
3. Commit with meaningful messages
4. Push and create a pull request

## License

MIT
