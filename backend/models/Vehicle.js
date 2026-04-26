const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add vehicle name'],
    trim: true,
  },
  brand: {
    type: String,
    required: [true, 'Please add brand'],
  },
  model: {
    type: String,
    required: [true, 'Please add model'],
  },
  year: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['car', 'bike', 'suv', 'luxury', 'electric'],
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  pricePerDay: {
    type: Number,
    required: [true, 'Please add price per day'],
    min: 0,
  },
  image: {
    type: String,
    required: true,
  },
  gallery: [String],
  description: {
    type: String,
    required: true,
  },
  features: [String],
  transmission: {
    type: String,
    enum: ['Manual', 'Automatic'],
    default: 'Manual',
  },
  seats: {
    type: Number,
    required: true,
  },
  fuelType: {
    type: String,
    enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
    required: true,
  },
  available: {
    type: Boolean,
    default: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 4.5,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      rating: Number,
      comment: String,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Vehicle', vehicleSchema);