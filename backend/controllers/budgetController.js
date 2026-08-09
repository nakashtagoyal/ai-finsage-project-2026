const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const aiService = require('../services/aiService');

exports.setBudget = async (req, res) => {
  try {
    const { category, limit, month } = req.body;
    const budget = await Budget.findOneAndUpdate(
      { user: req.userId, category, month },
      { limit },
      { upsert: true, new: true }
    );
    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: 'Failed to set budget', error: err.message });
  }
};

exports.getBudgets = async (req, res) => {
  try {
    const { month } = req.query;

    const query = { user: req.userId };
    if (month) query.month = month;

    const budgets = await Budget.find(query);

    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {

        const startDate = new Date(`${budget.month}-01`);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);

        const transactions = await Transaction.find({
          user: req.userId,
          type: "expense",
          category: budget.category,
          date: {
            $gte: startDate,
            $lt: endDate
          }
        });

        const spent = transactions.reduce(
          (total, t) => total + t.amount,
          0
        );

        return {
          ...budget.toObject(),
          spent
        };
      })
    );

    res.json(budgetsWithSpent);

  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch budgets",
      error: err.message
    });
  }
};

// AI-suggested budgets based on last 3 months of spending history
exports.suggestBudgets = async (req, res) => {
  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const transactions = await Transaction.find({
      user: req.userId,
      type: 'expense',
      date: { $gte: threeMonthsAgo }
    });

    const historyByCategory = {};
    transactions.forEach(t => {
      historyByCategory[t.category] = historyByCategory[t.category] || [];
      historyByCategory[t.category].push(t.amount);
    });
    const suggestions = await aiService.suggestBudgets({
      historyByCategory,
      monthlyIncome: req.body.monthlyIncome || 0
    });

    const month = new Date().toISOString().slice(0, 7);

    const budgetArray = Object.entries(suggestions).map(([category, limit]) => ({
      category,
      limit,
      month,
      spent: 0
    }));

    res.json(budgetArray);
  } catch (err) {
    res.status(500).json({ message: 'Failed to suggest budgets', error: err.message });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });
    res.json({ message: "Budget deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.userId,
      },
      req.body,
      { new: true }
    );

    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};