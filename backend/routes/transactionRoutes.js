const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createTransaction, getTransactions, updateTransaction, deleteTransaction, getSummary
} = require('../controllers/transactionController');

router.use(auth);
router.get('/summary', getSummary);
router.post('/', createTransaction);
router.get('/', getTransactions);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
