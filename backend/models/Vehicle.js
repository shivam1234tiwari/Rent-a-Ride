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
  category: {
    type: String,
    enum: ['bike', 'car', 'truck', 'self-driving', 'auto-rickshaw'],
    required: true,
  },
  subCategory: {
    type: String,
    enum: ['hatchback', 'sedan', 'suv', 'luxury', 'electric', 'sports', 'mini-truck', 'heavy-truck', 'autonomous'],
  },
  pricePerDay: {
    type: Number,
    required: [true, 'Please add price per day'],
    min: 0,
  },
  pricePerKm: {
    type: Number,
    default: 0,
  },
  securityDeposit: {
    type: Number,
    default: 0,
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
    enum: ['Manual', 'Automatic', 'Semi-Automatic'],
  },
  seats: {
    type: Number,
    required: true,
  },
  fuelType: {
    type: String,
    enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'],
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
  // Smart pricing fields
  basePrice: Number,
  peakHourMultiplier: { type: Number, default: 1.2 },
  demandMultiplier: { type: Number, default: 1.0 },
  lastPriceUpdate: Date,
  
  // Live tracking
  currentLocation: {
    lat: Number,
    lng: Number,
    lastUpdate: Date,
  },
  isTrackable: { type: Boolean, default: true },
  
  // Ride sharing
  allowRideSharing: { type: Boolean, default: false },
  maxPassengers: Number,
  sharedRidePrice: Number,
  
  // Driver assignment
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  driverRequired: { type: Boolean, default: false },
  driverPrice: { type: Number, default: 0 },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Vehicle', vehicleSchema);