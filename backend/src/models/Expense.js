const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true },
    amount: { type: Number, required: true, index: true },
    category: {
      type: String,
      enum: ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'],
      default: 'Other',
      index: true,
    },
    merchant: { type: String, default: '' },
    paymentMethod: { type: String, default: '' },
    description: { type: String, default: '' },
    invoiceImage: { type: String, default: '' },
    extractedText: { type: String, default: '' },
    expenseDate: { type: Date, default: Date.now, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    deleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
