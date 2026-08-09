# FinSage AI — Personal Finance Manager (MERN Stack)

A responsive, colorful, AI-powered personal finance manager built with MongoDB, Express, React, and Node.js.

## Features
- JWT auth (register/login)
- AI auto-categorization of transactions from free-text descriptions
- Conversational finance assistant (chatbot widget)
- Spending anomaly detection (compares this month vs 3-month average per category)
- AI-suggested monthly budgets based on spending history
- Savings goals with AI-recommended monthly contribution
- Real-time transaction updates via Socket.io
- Responsive, colorful dashboard (gradient theme, dark/light mode, animated cards)
- Pie chart spending breakdown (Recharts)
- Receipt OCR scaffold (Tesseract.js on the client + AI parsing endpoint)

## Project Structure
```
finsage-ai/
├── backend/          # Express API
│   ├── config/      # DB connection
│   ├── models/      # User, Transaction, Budget, Goal
│   ├── controllers/ # Route logic
│   ├── routes/      # Express routers
│   ├── services/    # aiService.js — all LLM calls isolated here
│   └── server.js
└── frontend/          # React (Vite) app
    └── src/
        ├── components/  # StatCard, SpendingChart, ChatbotWidget, etc.
        ├── pages/        # Login, Dashboard
        ├── context/      # AuthContext
        └── services/     # axios instance
```

## Setup

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI, JWT_SECRET, OPENAI_API_KEY
npm run dev
```
Server runs on `http://localhost:5000`.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
App runs on `http://localhost:5173` (proxies `/api` to the backend).

## Notes on the AI Layer
All AI calls live in `server/services/aiService.js`. It currently calls OpenAI's chat completions endpoint — swap the `callLLM` function for the Anthropic Messages API if you prefer Claude. Every AI feature (categorization, chat, budget suggestions) has a graceful fallback (keyword heuristics) if the API key is missing or the call fails, so the app still works without an AI key configured.

## What to Build Next
- Wire up Plaid sandbox for real bank sync
- Build the receipt upload UI (camera/file input → Tesseract.js OCR → `/api/ai/receipt`)
- Add recurring bill detection (group transactions by merchant + interval)
- Add gamification badges UI (streaks are already tracked on the User model)
- Add multi-currency conversion using a live exchange rate API
