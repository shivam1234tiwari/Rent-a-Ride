const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { updateProfile, getProfile } = require('../controllers/userController');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;