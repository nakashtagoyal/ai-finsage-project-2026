const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { setBudget, getBudgets, suggestBudgets, updateBudget, deleteBudget } = require('../controllers/budgetController');

router.use(auth);
router.post('/', setBudget);
router.get('/', getBudgets);
router.post('/suggest', suggestBudgets);
router.put("/:id", updateBudget);
router.delete("/:id", deleteBudget);

module.exports = router;