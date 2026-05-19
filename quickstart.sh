#!/bin/bash
# Quick Start Script for Smart Expense Tracker

echo "🚀 Smart Expense Tracker - Quick Start"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo "Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found. Please install Node.js v14+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

# Check npm
echo "Checking npm..."
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm --version)${NC}"
echo ""

# Backend setup
echo -e "${YELLOW}Installing backend dependencies...${NC}"
cd backend
npm install

# Create environment file
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please edit .env with your configuration${NC}"
fi

# Generate frontend
echo ""
echo -e "${YELLOW}Generating frontend scaffold...${NC}"
npm run setup

# Frontend setup
echo ""
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
cd ../frontend
npm install

echo ""
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your configuration"
echo "2. Open two terminal windows"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend"
echo "  npm run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend"
echo "  npm start"
echo ""
echo "Then visit:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:5000"
echo "  API Docs: http://localhost:5000/api/docs"
echo ""
