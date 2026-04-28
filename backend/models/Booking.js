const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  pickupLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: [Number],
    address: String,
  },
  dropoffLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: [Number],
    address: String,
  },
  totalDistance: Number,
  totalDays: {
    type: Number,
    required: true,
  },
  basePrice: Number,
  driverPrice: Number,
  taxAmount: Number,
  discountAmount: Number,
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'driver-assigned'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'partial'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'cash', 'netbanking'],
  },
  transactionId: String,
  
  // Ride sharing
  isSharedRide: { type: Boolean, default: false },
  sharedWith: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    shareAmount: Number,
  }],
  
  // Live tracking
  liveTracking: {
    enabled: { type: Boolean, default: false },
    currentLocation: {
      lat: Number,
      lng: Number,
    },
    lastUpdate: Date,
  },
  
  // User queries
  userQueries: [{
    query: String,
    response: String,
    askedAt: Date,
    respondedAt: Date,
    status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
  }],
  
  specialRequests: String,
  bookingDate: {
    type: Date,
    default: Date.now,
  },
});

// Index for geospatial queries
bookingSchema.index({ pickupLocation: '2dsphere' });
bookingSchema.index({ dropoffLocation: '2dsphere' });

module.exports = mongoose.model('Booking', bookingSchema);