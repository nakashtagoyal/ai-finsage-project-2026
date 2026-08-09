const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    currency: { type: String, default: 'USD' },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    monthlyIncome: { type: Number, default: 0 },
    streak: { type: Number, default: 0 }, // gamification: consecutive days under budget
    badges: [{ type: String }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
