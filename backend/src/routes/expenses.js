const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const upload = require('../middleware/upload');

router.post('/upload', upload.single('file'), expenseController.uploadAndExtract);

router.post('/', [body('amount').isNumeric()], expenseController.createExpense);
router.get('/', expenseController.listExpenses);
router.get('/:id', expenseController.getExpense);
router.put('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
