const mongoose = require("mongoose");
const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    targetAmount: {
      type: Number,
      required: true,
    },
    savedAmount: {
      type: Number,
      default: 0,
    },
    targetDate: {
      type: Date,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    purchased: {
      type: Boolean,
      default: false,
    },

    purchasedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }

);

module.exports = mongoose.model("Goal", goalSchema);