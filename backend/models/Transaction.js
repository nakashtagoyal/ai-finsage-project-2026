const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: {
      type: String,
      enum: [
        'Food & Dining', 'Groceries', 'Transport', 'Housing', 'Utilities',
        'Entertainment', 'Health', 'Shopping', 'Subscriptions', 'Travel',
        'Education', 'Income', 'Savings', 'Other'
      ],
      default: 'Other'
    },
    merchant: { type: String, trim: true },
    description: { type: String, trim: true },
    date: { type: Date, default: Date.now },
    source: { type: String, enum: ['manual', 'receipt-scan', 'bank-sync', 'voice'], default: 'manual' },
    aiConfidence: { type: Number, min: 0, max: 1 }, // confidence score from auto-categorization
    isRecurring: { type: Boolean, default: false },
    isAnomaly: { type: Boolean, default: false }
  },
  { timestamps: true }
);

TransactionSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
