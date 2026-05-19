@echo off
REM Quick Start Script for Smart Expense Tracker (Windows)

echo.
echo ========================================
echo Smart Expense Tracker - Quick Start
echo ========================================
echo.

REM Check Node.js
echo Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found. Please install Node.js v14+
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION%

REM Check npm
echo Checking npm...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm not found
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [OK] npm %NPM_VERSION%
echo.

REM Backend setup
echo Installing backend dependencies...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install backend dependencies
    exit /b 1
)

REM Create environment file
if not exist .env (
    echo Creating .env file...
    if exist .env.example (
        copy .env.example .env
        echo [WARNING] Please edit .env with your configuration
    )
)

REM Generate frontend
echo.
echo Generating frontend scaffold...
call npm run setup
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to generate frontend
    exit /b 1
)

REM Frontend setup
echo.
echo Installing frontend dependencies...
cd ..\frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install frontend dependencies
    exit /b 1
)

echo.
echo ========================================
echo [SUCCESS] Setup complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit backend\.env with your configuration
echo 2. Open two command prompt/PowerShell windows
echo.
echo Terminal 1 (Backend):
echo   cd backend
echo   npm run dev
echo.
echo Terminal 2 (Frontend):
echo   cd frontend
echo   npm start
echo.
echo Then visit:
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:5000
echo   API Docs: http://localhost:5000/api/docs
echo.
pause
