const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { chat, detectAnomalies, parseReceipt } = require('../controllers/aiController');

router.use(auth);
router.post('/chat', chat);
router.get('/anomalies', detectAnomalies);
router.post('/receipt', parseReceipt);

module.exports = router;
