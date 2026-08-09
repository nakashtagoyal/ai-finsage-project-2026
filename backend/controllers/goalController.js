const Goal = require("../models/Goal");
const Transaction = require("../models/Transaction");

// Get all goals
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.userId }).sort({
      createdAt: -1,
    });

    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create goal
const createGoal = async (req, res) => {
  try {
    const goal = await Goal.create({
      userId: req.userId,
      title: req.body.title,
      targetAmount: req.body.targetAmount,
      savedAmount: req.body.savedAmount || 0,
      targetDate: req.body.targetDate,
    });

    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update goal
const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    if (req.body.title !== undefined) goal.title = req.body.title;
    if (req.body.targetAmount !== undefined) goal.targetAmount = req.body.targetAmount;
    if (req.body.targetDate !== undefined) goal.targetDate = req.body.targetDate;
    if (req.body.savedAmount !== undefined) goal.savedAmount = req.body.savedAmount;

    // Automatically mark goal as completed
    if (goal.savedAmount >= goal.targetAmount && !goal.completed) {
      goal.completed = true;
      goal.completedAt = new Date();
    }

    await goal.save();

    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Purchase Goal
const purchaseGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    if (goal.purchased) {
      return res.status(400).json({
        message: "Goal already purchased",
      });
    }

    // Create purchase transaction
    await Transaction.create({
      user: req.userId,
      amount: goal.targetAmount,
      type: "expense",
      category: "Shopping",
      merchant: goal.title,
      description: `Purchased ${goal.title} using savings`,
    });

    // Record savings deduction
    // await Transaction.create({
    //   user: req.userId,
    //   amount: goal.targetAmount,
    //   type: "saving",
    //   category: "Savings",
    //   merchant: "Savings Account",
    //   description: `Savings used for ${goal.title}`,
    // });

    // Remove money from savings
    goal.savedAmount = 0;

    // Mark as purchased
    goal.purchased = true;
    goal.purchasedAt = new Date();

    await goal.save();

    res.json({
      message: "Goal purchased successfully",
      goal,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Delete goal
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!goal) {
      return res.status(404).json({
        message: "Goal not found",
      });
    }

    // If the goal was purchased, remove its expense transaction
    if (goal.purchased) {
      await Transaction.findOneAndDelete({
        user: req.userId,
        description: goal.title,
        amount: goal.targetAmount,
        type: "expense",
      });
    }

    await Goal.findByIdAndDelete(goal._id);

    res.json({
      message: "Goal deleted successfully",
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  purchaseGoal,
};