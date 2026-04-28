const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'driver'],
    default: 'user',
  },
  avatar: {
    type: String,
    default: 'https://ui-avatars.com/api/?background=random',
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
  },
  // Driver specific fields
  driverProfile: {
    licenseNumber: String,
    experience: Number,
    rating: { type: Number, default: 0 },
    totalTrips: { type: Number, default: 0 },
    completedTrips: { type: Number, default: 0 },
    cancelledTrips: { type: Number, default: 0 },
    availability: { type: Boolean, default: true },
    currentLocation: {
      lat: Number,
      lng: Number,
    },
    vehicleAssigned: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
    },
    documents: {
      aadharCard: String,
      panCard: String,
      drivingLicense: String,
    },
    earnings: { type: Number, default: 0 },
    joinDate: { type: Date, default: Date.now },
  },
  preferences: {
    preferredVehicleType: [String],
    preferredLanguage: { type: String, default: 'english' },
    notificationsEnabled: { type: Boolean, default: true },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);