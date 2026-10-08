const express = require('express');
const router = express.Router();
const { getLoyaltyBalance } = require('../controllers/loyaltyController');
const { protect } = require('../middleware/auth');

router.get('/balance', protect, getLoyaltyBalance);

module.exports = router;
