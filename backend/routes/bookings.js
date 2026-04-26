const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  updateBookingStatus,
} = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .post(protect, createBooking)
  .get(protect, getUserBookings);

router.route('/:id')
  .get(protect, getBookingById)
  .put(protect, cancelBooking);

router.route('/:id/status')
  .put(protect, admin, updateBookingStatus);

module.exports = router;