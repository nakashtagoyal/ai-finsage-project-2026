const Feedback = require("../models/Feedback");

exports.addFeedback = async (req, res) => {
  try {
    const { name, rating, email, review } = req.body;

    const feedback = await Feedback.create({
      user: req.userId,
      name,
      rating,
      email,
      review,
    });

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully.",
      feedback,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};