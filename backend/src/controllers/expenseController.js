const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const Expense = require('../models/Expense');
const geminiService = require('../services/geminiService');

const uploadAndExtract = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const filePath = req.file.path;
    const result = await geminiService.analyzeInvoice(filePath);

    // Build expense object
    const expenseData = {
      title: result.title || req.file.originalname,
      amount: result.amount || 0,
      category: result.category || 'Other',
      merchant: result.merchant || '',
      paymentMethod: result.paymentMethod || '',
      description: result.description || '',
      invoiceImage: req.file.filename,
      extractedText: result.extractedText || '',
      expenseDate: result.invoiceDate || new Date(),
      user: req.user?.id || null,
    };

    const expense = await Expense.create(expenseData);
    res.status(201).json(expense);
  } catch (err) {
    next(err);
  }
};

const createExpense = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const expenseDate = req.body.expenseDate || req.body.date || new Date();
    const title = req.body.title || req.body.description || req.body.category || 'Expense';
    const data = {
      ...req.body,
      title,
      expenseDate,
      user: req.user?.id || null,
    };
    const expense = await Expense.create(data);
    res.status(201).json(expense);
  } catch (err) {
    next(err);
  }
};

const listExpenses = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, q, category, startDate, endDate, minAmount, maxAmount } = req.query;
    const skip = (page - 1) * limit;
    const filter = { deleted: false };
    if (req.user?.id) filter.user = req.user.id;
    if (q) filter.$or = [{ title: new RegExp(q, 'i') }, { description: new RegExp(q, 'i') }];
    if (category) filter.category = category;
    if (startDate || endDate) filter.expenseDate = {};
    if (startDate) filter.expenseDate.$gte = new Date(startDate);
    if (endDate) filter.expenseDate.$lte = new Date(endDate);
    if (minAmount || maxAmount) filter.amount = {};
    if (minAmount) filter.amount.$gte = Number(minAmount);
    if (maxAmount) filter.amount.$lte = Number(maxAmount);

    const total = await Expense.countDocuments(filter);
    const items = await Expense.find(filter).sort({ expenseDate: -1 }).skip(skip).limit(Number(limit));
    res.json({ total, page: Number(page), pageSize: items.length, items });
  } catch (err) {
    next(err);
  }
};

const getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, deleted: false, ...(req.user?.id ? { user: req.user.id } : {}) });
    if (!expense) return res.status(404).json({ message: 'Not found' });
    res.json(expense);
  } catch (err) {
    next(err);
  }
};

const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndUpdate({ _id: req.params.id, ...(req.user?.id ? { user: req.user.id } : {}) }, req.body, { new: true });
    if (!expense) return res.status(404).json({ message: 'Not found' });
    res.json(expense);
  } catch (err) {
    next(err);
  }
};

const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndUpdate({ _id: req.params.id, ...(req.user?.id ? { user: req.user.id } : {}) }, { deleted: true }, { new: true });
    if (!expense) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadAndExtract,
  createExpense,
  listExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
};
