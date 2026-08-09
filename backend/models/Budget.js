const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: String, required: true },
    limit: { type: Number, required: true },
    month: { type: String, required: true }, // format: "2026-08"
    aiSuggested: { type: Boolean, default: false }
  },
  { timestamps: true }
);

BudgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);
