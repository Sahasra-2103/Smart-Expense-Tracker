@echo off
REM Frontend Generator Script
REM Creates the complete frontend structure

setlocal enabledelayedexpansion

cd /d d:\Tracker

REM Create directories
echo Creating frontend directories...
mkdir frontend\public 2>nul
mkdir frontend\src 2>nul
mkdir frontend\src\components 2>nul
mkdir frontend\src\pages 2>nul
mkdir frontend\src\services 2>nul
mkdir frontend\src\context 2>nul
mkdir frontend\src\utils 2>nul
mkdir frontend\src\hooks 2>nul

echo.
echo ✓ Directories created
echo.

REM Create package.json
echo Creating package.json...
(
echo {
echo   "name": "smart-expense-tracker-frontend",
echo   "version": "0.1.0",
echo   "private": true,
echo   "proxy": "http://localhost:5000",
echo   "dependencies": {
echo     "react": "^18.2.0",
echo     "react-dom": "^18.2.0",
echo     "react-router-dom": "^6.14.0",
echo     "axios": "^1.4.0",
echo     "date-fns": "^2.30.0"
echo   },
echo   "scripts": {
echo     "start": "react-scripts start",
echo     "build": "react-scripts build",
echo     "test": "react-scripts test",
echo     "eject": "react-scripts eject"
echo   },
echo   "eslintConfig": {
echo     "extends": ["react-app"]
echo   },
echo   "browserslist": {
echo     "production": [">0.2%%", "not dead", "not op_mini all"],
echo     "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
echo   },
echo   "devDependencies": {
echo     "react-scripts": "5.0.1"
echo   }
echo }
) > frontend\package.json

echo ✓ package.json created
echo.

REM Create public/index.html
echo Creating public/index.html...
(
echo ^<!DOCTYPE html^>
echo ^<html lang="en"^>
echo   ^<head^>
echo     ^<meta charset="UTF-8" /^>
echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0" /^>
echo     ^<title^>Smart Expense Tracker^</title^>
echo   ^</head^>
echo   ^<body^>
echo     ^<div id="root"^>^</div^>
echo   ^</body^>
echo ^</html^>
) > frontend\public\index.html

echo ✓ public/index.html created
echo.

REM Create src/index.js
echo Creating src/index.js...
(
echo import React from 'react';
echo import ReactDOM from 'react-dom/client';
echo import App from './App';
echo import './index.css';
echo.
echo const root = ReactDOM.createRoot(document.getElementById('root'^)^);
echo root.render(
echo   ^<React.StrictMode^>
echo     ^<App /^>
echo   ^</React.StrictMode^>
echo ^);
) > frontend\src\index.js

echo ✓ src/index.js created
echo.

REM Create src/index.css
echo Creating src/index.css...
(
echo * {
echo   margin: 0;
echo   padding: 0;
echo   box-sizing: border-box;
echo }
echo.
echo body {
echo   font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
echo     'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
echo     sans-serif;
echo   -webkit-font-smoothing: antialiased;
echo   -moz-osx-font-smoothing: grayscale;
echo   background-color: #f5f5f5;
echo }
echo.
echo html, body, #root {
echo   height: 100%%;
echo }
) > frontend\src\index.css

echo ✓ src/index.css created
echo.

REM Create src/App.js
echo Creating src/App.js...
(
echo import React from 'react';
echo import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
echo import './App.css';
echo.
echo function App(^ {
echo   return (
echo     ^<Router^>
echo       ^<div className="App"^>
echo         ^<header className="App-header"^>
echo           ^<h1^>Smart Expense Tracker^</h1^>
echo           ^<p^>Track expenses with AI-powered insights^</p^>
echo         ^</header^>
echo         ^<main className="App-main"^>
echo           ^<Routes^>
echo             ^<Route path="/" element={^<div^>Home Page - Coming Soon^</div^>} /^>
echo           ^</Routes^>
echo         ^</main^>
echo       ^</div^>
echo     ^</Router^>
echo   ^);
echo }
echo.
echo export default App;
) > frontend\src\App.js

echo ✓ src/App.js created
echo.

REM Create src/App.css
echo Creating src/App.css...
(
echo .App {
echo   min-height: 100vh;
echo   background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%^);
echo   color: white;
echo }
echo.
echo .App-header {
echo   text-align: center;
echo   padding: 3rem 1rem;
echo }
echo.
echo .App-header h1 {
echo   font-size: 2.5rem;
echo   margin-bottom: 0.5rem;
echo }
echo.
echo .App-header p {
echo   font-size: 1.1rem;
echo   opacity: 0.9;
echo }
echo.
echo .App-main {
echo   max-width: 1200px;
echo   margin: 2rem auto;
echo   padding: 0 1rem;
echo }
) > frontend\src\App.css

echo ✓ src/App.css created
echo.

REM Create src/services/api.js
echo Creating src/services/api.js...
(
echo import axios from 'axios';
echo.
echo const API_BASE_URL = process.env.REACT_APP_API_URL ^|^| 'http://localhost:5000/api';
echo.
echo const api = axios.create({^{
echo   baseURL: API_BASE_URL,
echo   headers: {^{
echo     'Content-Type': 'application/json',
echo   }^},
echo }^});
echo.
echo api.interceptors.request.use((config^ =^> {^{
echo   const token = localStorage.getItem('token'^);
echo   if (token^ {^{
echo     config.headers.Authorization = ^`Bearer ^$^{token^}^`;
echo   }^}
echo   return config;
echo }^});
echo.
echo export default api;
) > frontend\src\services\api.js

echo ✓ src/services/api.js created
echo.

REM Create src/context/AuthContext.js
echo Creating src/context/AuthContext.js...
(
echo import React, { createContext, useState } from 'react';
echo.
echo export const AuthContext = createContext(^);
echo.
echo export function AuthProvider({ children }^ {^{
echo   const [user, setUser] = useState(null^);
echo   const [loading, setLoading] = useState(false^);
echo.
echo   return (
echo     ^<AuthContext.Provider value={{ user, setUser, loading, setLoading }}^>
echo       {children}
echo     ^</AuthContext.Provider^>
echo   ^);
echo }^}
) > frontend\src\context\AuthContext.js

echo ✓ src/context/AuthContext.js created
echo.

REM Create src/hooks/useAuth.js
echo Creating src/hooks/useAuth.js...
(
echo import { useContext } from 'react';
echo import { AuthContext } from '../context/AuthContext';
echo.
echo export function useAuth(^ {^{
echo   const context = useContext(AuthContext^);
echo   if (!context^ {^{
echo     throw new Error('useAuth must be used within AuthProvider'^);
echo   }^}
echo   return context;
echo }^}
) > frontend\src\hooks\useAuth.js

echo ✓ src/hooks/useAuth.js created
echo.

REM Create .gitignore
echo Creating .gitignore...
(
echo # Dependencies
echo node_modules/
echo /.pnp
echo .pnp.js
echo.
echo # Testing
echo /coverage
echo.
echo # Production
echo /build
echo /dist
echo.
echo # Misc
echo .DS_Store
echo .env.local
echo .env.development.local
echo .env.test.local
echo .env.production.local
echo.
echo npm-debug.log*
echo yarn-debug.log*
echo yarn-error.log*
) > frontend\.gitignore

echo ✓ .gitignore created
echo.

echo ========================================
echo ✓ Frontend scaffold created successfully!
echo ========================================
echo.
echo Next steps:
echo   cd frontend
echo   npm install
echo   npm start
echo.
