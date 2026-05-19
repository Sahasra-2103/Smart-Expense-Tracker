const Expense = require('../models/Expense');

const monthly = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { year = new Date().getFullYear() } = req.query;
    const pipeline = [
      { $match: { user: require('mongoose').Types.ObjectId(userId), deleted: false } },
      { $project: { amount: 1, month: { $month: '$expenseDate' }, year: { $year: '$expenseDate' } } },
      { $match: { year: Number(year) } },
      { $group: { _id: '$month', total: { $sum: '$amount' } } },
      { $sort: { _id: 1 } },
    ];
    const data = await Expense.aggregate(pipeline);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const categories = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const pipeline = [
      { $match: { user: require('mongoose').Types.ObjectId(userId), deleted: false } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ];
    const data = await Expense.aggregate(pipeline);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const trends = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { months = 6 } = req.query;
    const from = new Date();
    from.setMonth(from.getMonth() - months);
    const pipeline = [
      { $match: { user: require('mongoose').Types.ObjectId(userId), deleted: false, expenseDate: { $gte: from } } },
      { $project: { amount: 1, month: { $dateToString: { format: '%Y-%m', date: '$expenseDate' } } } },
      { $group: { _id: '$month', total: { $sum: '$amount' } } },
      { $sort: { _id: 1 } },
    ];
    const data = await Expense.aggregate(pipeline);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const recent = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const items = await Expense.find({ user: userId, deleted: false }).sort({ createdAt: -1 }).limit(10);
    res.json(items);
  } catch (err) {
    next(err);
  }
};

module.exports = { monthly, categories, trends, recent };
