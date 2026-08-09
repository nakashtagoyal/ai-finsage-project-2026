const Transaction = require('../models/Transaction');
const aiService = require('../services/aiService');

// Chatbot: "How much did I spend on groceries in June?"
exports.chat = async (req, res) => {
  try {
    const { question } = req.body;
    const transactions = await Transaction.find({ user: req.userId }).sort({ date: -1 }).limit(500);

    const byCategory = {};
    transactions.forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + (t.type === 'expense' ? t.amount : 0);
    });

    const answer = await aiService.askFinanceAssistant({
      question,
      transactionsSummary: { totalTransactions: transactions.length, byCategory }
    });

    res.json({ answer });
  } catch (err) {
    res.status(500).json({ message: 'AI assistant failed', error: err.message });
  }
};

// Anomaly detection across current vs previous period
exports.detectAnomalies = async (req, res) => {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastThreeMonths = new Date(now.getFullYear(), now.getMonth() - 3, 1);

    const currentTx = await Transaction.find({
      user: req.userId, type: 'expense', date: { $gte: startOfThisMonth }
    });
    const historicalTx = await Transaction.find({
      user: req.userId, type: 'expense', date: { $gte: startOfLastThreeMonths, $lt: startOfThisMonth }
    });

    const currentByCategory = {};
    currentTx.forEach(t => { currentByCategory[t.category] = (currentByCategory[t.category] || 0) + t.amount; });

    const historicalByCategory = {};
    historicalTx.forEach(t => { historicalByCategory[t.category] = (historicalByCategory[t.category] || 0) + t.amount; });
    Object.keys(historicalByCategory).forEach(cat => { historicalByCategory[cat] /= 3; }); // monthly avg

    const anomalies = aiService.detectAnomalies(currentByCategory, historicalByCategory);
    res.json({ anomalies });
  } catch (err) {
    res.status(500).json({ message: 'Anomaly detection failed', error: err.message });
  }
};

// Receipt scan: client sends OCR'd text (Tesseract.js), we extract structured data via AI
exports.parseReceipt = async (req, res) => {
  try {
    const { ocrText } = req.body;
    const result = await aiService.categorizeTransaction({ description: ocrText, merchant: '', amount: 0 });
    // In a full build, use a dedicated extraction prompt to also pull amount/merchant/date from ocrText
    res.json({ suggestedCategory: result.category, rawText: ocrText });
  } catch (err) {
    res.status(500).json({ message: 'Receipt parsing failed', error: err.message });
  }
};
