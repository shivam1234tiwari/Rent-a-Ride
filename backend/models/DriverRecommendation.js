const mongoose = require('mongoose');

const driverRecommendationSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recommendedDrivers: [{
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    score: Number,
    rating: Number,
    experience: Number,
    distance: Number,
    completionRate: Number,
    reason: String,
  }],
  selectedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  algorithmVersion: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('DriverRecommendation', driverRecommendationSchema);