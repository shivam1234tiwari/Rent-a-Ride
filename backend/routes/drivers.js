const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  recommendDrivers,
  selectDriver,
  updateDriverLocation,
} = require('../controllers/driverController');

router.post('/recommend', protect, recommendDrivers);
router.post('/select', protect, selectDriver);
router.put('/location', protect, updateDriverLocation);

module.exports = router;