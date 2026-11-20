/**
 * aiService.js
 * Wraps calls to an LLM (Anthropic/OpenAI) for the "smart" features:
 *  - auto-categorization of transactions from free-text descriptions
 *  - natural language finance Q&A (chatbot)
 *  - spending anomaly detection
 *  - AI-suggested savings goal contributions
 *
 * Swap ANTHROPIC/OPENAI calls below for whichever provider you use.
 * This file isolates all AI calls so the rest of the app never talks to the API directly.
 */

const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const CATEGORIES = [
  'Food & Dining', 'Groceries', 'Transport', 'Housing', 'Utilities',
  'Entertainment', 'Health', 'Shopping', 'Subscriptions', 'Travel',
  'Education', 'Income', 'Savings', 'Other'
];

// Example using fetch to call an LLM provider. Replace URL/headers/model as needed.
async function callLLM(prompt) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing in .env");
  }

  const completion = await client.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.2,
  });

  return completion.choices[0].message.content;
}

// 1. Auto-categorize a transaction from its description/merchant
async function categorizeTransaction({ description, merchant, amount }) {
  const prompt = `
Classify this financial transaction into exactly one category from this list:
${CATEGORIES.join(', ')}

Transaction:
Description: ${description || 'N/A'}
Merchant: ${merchant || 'N/A'}
Amount: ${amount}

Respond ONLY with valid JSON, no markdown, no explanation:
{"category": "<one of the categories>", "confidence": <number between 0 and 1>}
`;
  try {
    const raw = await callLLM(prompt);
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    if (!CATEGORIES.includes(parsed.category)) parsed.category = 'Other';
    return parsed;
  } catch (err) {
    // Fallback: simple keyword heuristic if AI call fails
    return keywordFallback(description, merchant);
  }
}

function keywordFallback(description = '', merchant = '') {
  const text = `${description} ${merchant}`.toLowerCase();
  const rules = [
    { keys: ['uber', 'lyft', 'taxi', 'gas', 'fuel'], category: 'Transport' },
    { keys: ['grocery', 'supermarket', 'walmart', 'whole foods'], category: 'Groceries' },
    { keys: ['netflix', 'spotify', 'subscription', 'prime'], category: 'Subscriptions' },
    { keys: ['rent', 'mortgage'], category: 'Housing' },
    { keys: ['restaurant', 'cafe', 'coffee', 'doordash'], category: 'Food & Dining' },
    { keys: ['salary', 'payroll', 'deposit'], category: 'Income' }
  ];
  for (const rule of rules) {
    if (rule.keys.some((k) => text.includes(k))) {
      return { category: rule.category, confidence: 0.6 };
    }
  }
  return { category: 'Other', confidence: 0.3 };
}

// 2. Conversational finance assistant — answers questions grounded in the user's own data
async function askFinanceAssistant({ question, transactionsSummary }) {
  const prompt = `
You are FinSage AI, the intelligent assistant for the FinSage Personal Finance application.

Your responsibilities:
- Answer questions about the FinSage application and its features.
- Answer general personal finance questions.
- Give budgeting, saving, investing, and spending advice.
- Explain how users can use different features of the app.
- Use the user's transaction data whenever it is relevant.
- If the question is general, answer from your financial knowledge.
- If transaction data is available, personalize your answer using it.
- If the app does not have a requested feature, politely tell the user it is not currently available.
- Be friendly, professional, and conversational.
- Keep responses under 6 sentences.

About FinSage:
- AI-powered personal finance management application.
- Tracks income and expenses.
- Automatically categorizes transactions.
- Displays dashboards, charts, and spending analytics.
- Detects unusual spending patterns.
- Suggests monthly budgets.
- Includes an AI financial assistant.

User transaction summary:
${JSON.stringify(transactionsSummary, null, 2)}

User question:
${question}
`;

  return callLLM(prompt);
}

// 3. Detect anomalies by comparing recent spend per category to historical average
function detectAnomalies(currentPeriodByCategory, historicalAvgByCategory, threshold = 1.75) {
  const anomalies = [];
  for (const category of Object.keys(currentPeriodByCategory)) {
    const current = currentPeriodByCategory[category];
    const avg = historicalAvgByCategory[category] || 0;
    if (avg > 0 && current > avg * threshold) {
      anomalies.push({
        category,
        current,
        average: avg,
        multiplier: +(current / avg).toFixed(2)
      });
    }
  }
  return anomalies;
}

// 4. Predictive budget suggestion for next month per category (simple trend-based, LLM-refined)
async function suggestBudgets({ historyByCategory, monthlyIncome }) {
  const prompt = `
Given this user's spending history by category over recent months (JSON) and their
monthly income of ${monthlyIncome}, suggest a realistic monthly budget per category
for next month. Favor slightly reducing categories that trend upward, and leave healthy
categories flat. Respond ONLY with valid JSON: an object mapping category name to a number.

History: ${JSON.stringify(historyByCategory)}
`;
  const raw = await callLLM(prompt);
  const clean = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

module.exports = {
  CATEGORIES,
  categorizeTransaction,
  askFinanceAssistant,
  detectAnomalies,
  suggestBudgets
};
