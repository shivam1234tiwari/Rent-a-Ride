const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { processMessage, getChatHistory } = require('../controllers/chatController');

router.post('/message', protect, processMessage);
router.get('/history/:sessionId', protect, getChatHistory);

module.exports = router;