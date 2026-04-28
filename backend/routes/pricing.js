const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { calculateSmartPrice, updateDemandMultiplier } = require('../controllers/pricingController');

router.post('/calculate', protect, calculateSmartPrice);
router.put('/update-demand/:vehicleId', protect, updateDemandMultiplier);

module.exports = router;