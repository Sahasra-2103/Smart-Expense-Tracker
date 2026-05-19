# Project Setup Guide

## ✅ Completed Setup

### Backend Preparation
- ✓ `src/server.js` - Server entry point created
- ✓ `src/app.js` - Express app configuration ready
- ✓ Backend structure complete with:
  - Routes (auth, expenses, analytics)
  - Models, Controllers, Services
  - Middleware (authentication, error handling)
  - Validation schemas
  - Configuration files
- ✓ Dependencies defined in `package.json`
- ✓ Bootstrap script created (`src/utils/bootstrap.js`) for frontend scaffolding

### Frontend Scaffolding
- ✓ Automatic scaffolding script prepared
- ✓ Will generate complete React project structure
- ✓ Includes authentication context and hooks
- ✓ API service layer configured
- ✓ Routing ready for implementation

## 🚀 Getting Started

### Step 1: Backend Setup (from project root)

```bash
cd backend
npm install  # Install all backend dependencies
```

### Step 2: Environment Configuration

Create `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense_tracker
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
GEMINI_API_KEY=your-gemini-api-key
UPLOADS_DIR=uploads
NODE_ENV=development
```

### Step 3: Create Frontend Scaffold

From the backend directory:

```bash
npm run setup
```

This will automatically:
- Create frontend directory structure
- Generate `package.json` with dependencies
- Create React component scaffold
- Set up context API for state management
- Configure API service layer

### Step 4: Frontend Setup

```bash
cd ../frontend
npm install  # Install React and dependencies
```

### Step 5: Start Development

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev  # Starts with auto-reload on file changes
```

Backend will be available at: `http://localhost:5000`
API Docs: `http://localhost:5000/api/docs`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start    # Starts React development server
```

Frontend will be available at: `http://localhost:3000`

## 📁 Project Structure After Setup

```
Tracker/
├── backend/
│   ├── src/
│   │   ├── server.js              # Entry point
│   │   ├── app.js                 # Express config
│   │   ├── config/
│   │   │   └── database.js        # MongoDB connection
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── expenses.js
│   │   │   └── analytics.js
│   │   ├── models/                # Mongoose schemas
│   │   ├── controllers/           # Route handlers
│   │   ├── services/              # Business logic
│   │   ├── middleware/            # Auth, error handling
│   │   ├── validations/           # Input validation
│   │   └── utils/
│   │       └── bootstrap.js       # Frontend scaffolder
│   ├── .env                       # Environment config
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── frontend/                      # Created by npm run setup
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── pages/                 # Page components
│   │   ├── services/
│   │   │   └── api.js             # Axios configuration
│   │   ├── context/
│   │   │   └── AuthContext.js     # Auth state
│   │   ├── hooks/
│   │   │   └── useAuth.js         # Auth hook
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json
│   └── README.md
└── README.md                      # This file
```

## 📋 Available npm Scripts

### Backend (from `backend/` directory)
- `npm install` - Install dependencies
- `npm run dev` - Start with auto-reload (nodemon)
- `npm start` - Start production server
- `npm run setup` - Create frontend scaffold
- `npm run lint` - Run linter (currently echoes message)

### Frontend (from `frontend/` directory)
- `npm install` - Install dependencies
- `npm start` - Start dev server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (⚠️ irreversible)

## 🔧 Backend Features Ready for Implementation

### Authentication (`/api/auth`)
- User registration
- User login
- JWT token management
- Password hashing with bcryptjs

### Expenses (`/api/expenses`)
- CRUD operations for expenses
- Image upload and OCR support
- AI-powered categorization

### Analytics (`/api/analytics`)
- Expense summaries
- Category breakdowns
- Spending trends
- Date range filtering

## 🎨 Frontend Features Ready for Implementation

### Core Components
- Auth Context for state management
- useAuth hook for easy access
- API service with axios interceptors
- React Router setup for navigation
- Responsive styling foundation

### Pre-configured Services
- Automatic JWT token injection
- Base URL configuration
- Error handling interceptors

## ⚠️ Important Notes

1. **Database**: Make sure MongoDB is running before starting the backend
2. **API Keys**: Add your Google Gemini API key to `.env`
3. **CORS**: Frontend proxy is configured in `frontend/package.json` as `"proxy": "http://localhost:5000"`
4. **Ports**: 
   - Backend: 5000
   - Frontend: 3000
   - MongoDB: 27017 (if running locally)

## 🐛 Troubleshooting

### Backend won't start
- Check `.env` file exists
- Verify MongoDB connection string
- Ensure port 5000 is available

### Frontend build fails
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Clear npm cache: `npm cache clean --force`

### API calls failing
- Check backend is running on `http://localhost:5000`
- Verify proxy setting in frontend `package.json`
- Check browser console for CORS errors

## 📚 Next Steps

1. Implement authentication pages (Login, Register)
2. Create expense list and form components
3. Implement receipt upload with preview
4. Set up analytics dashboard
5. Add category management
6. Implement date filters and search
7. Deploy to production

---

Happy coding! 🎉
