const Transaction = require('../models/Transaction');
const aiService = require('../services/aiService');
const Goal = require("../models/Goal");

// Create transaction; auto-categorize with AI if no category given
exports.createTransaction = async (req, res) => {
  try {
    const { amount, type, category, merchant, description, date, source } = req.body;
    let finalCategory = category;
    let aiConfidence;

    // Auto-categorize every expense using AI
    if (type.toLowerCase() === "expense") {
      const result = await aiService.categorizeTransaction({
        description,
        merchant,
        amount,
      });

      finalCategory = result.category;
      aiConfidence = result.confidence;
    }

    // Income transactions
    if (type.toLowerCase() === "income") {
      finalCategory = "Income";
    }

    const transaction = await Transaction.create({
      user: req.userId,
      amount,
      type,
      category: finalCategory,
      merchant,
      description,
      date,
      source: source || 'manual',
      aiConfidence
    });

    // Real-time push to client (e.g. dashboard updates instantly)
    const io = req.app.get('io');
    io.emit(`transaction:${req.userId}`, transaction);

    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create transaction', error: err.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const { category, startDate, endDate, limit = 100 } = req.query;
    const query = { user: req.userId };
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    const transactions = await Transaction.find(query).sort({ date: -1 }).limit(Number(limit));
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch transactions', error: err.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    );
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update transaction', error: err.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const result = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!result) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete transaction', error: err.message });
  }
};

// Dashboard summary: totals, breakdown by category, monthly trend
exports.getSummary = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.userId });
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  
    const goals = await Goal.find({ userId: req.userId});
    const totalSavings = goals.reduce((sum, goal) => sum + (goal.savedAmount || 0), 0);

    const byCategory = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });

    res.json({
      totalIncome,
      totalExpense,
      totalSavings,
      balance: totalIncome - totalExpense - totalSavings,
      byCategory
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to compute summary', error: err.message });
  }
};
