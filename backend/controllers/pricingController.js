const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');

// Calculate smart price based on demand
const calculateSmartPrice = async (req, res) => {
  try {
    const { vehicleId, startDate, endDate, isPeakHour, isSharedRide } = req.body;
    
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    let basePrice = vehicle.pricePerDay;
    let multiplier = 1.0;
    let priceBreakdown = {};
    
    // Factor 1: Peak hour multiplier
    if (isPeakHour) {
      multiplier *= vehicle.peakHourMultiplier;
      priceBreakdown.peakHour = `+${(vehicle.peakHourMultiplier - 1) * 100}%`;
    }
    
    // Factor 2: Demand multiplier
    const bookingsCount = await Booking.countDocuments({
      vehicle: vehicleId,
      status: { $in: ['confirmed', 'pending'] },
      startDate: { $lte: new Date(endDate) },
      endDate: { $gte: new Date(startDate) },
    });
    
    if (bookingsCount > 0) {
      const demandFactor = Math.min(2.0, 1 + (bookingsCount / 10));
      multiplier *= demandFactor;
      priceBreakdown.demand = `+${Math.round((demandFactor - 1) * 100)}% demand`;
    }
    
    // Factor 3: Booking advance discount
    const daysInAdvance = Math.ceil((new Date(startDate) - new Date()) / (1000 * 60 * 60 * 24));
    let advanceDiscount = 0;
    if (daysInAdvance > 7) {
      advanceDiscount = 0.1; // 10% discount for booking 7+ days in advance
      priceBreakdown.advanceDiscount = `-10% (${daysInAdvance} days in advance)`;
    } else if (daysInAdvance > 3) {
      advanceDiscount = 0.05; // 5% discount for booking 3-6 days in advance
      priceBreakdown.advanceDiscount = `-5% (${daysInAdvance} days in advance)`;
    }
    
    // Factor 4: Ride sharing discount
    let rideShareDiscount = 0;
    if (isSharedRide) {
      rideShareDiscount = 0.3; // 30% discount for ride sharing
      priceBreakdown.rideShare = `-30% (Ride sharing enabled)`;
    }
    
    // Calculate final price
    const demandPrice = basePrice * multiplier;
    const finalPrice = demandPrice * (1 - advanceDiscount) * (1 - rideShareDiscount);
    
    // Calculate GST (18%)
    const gst = finalPrice * 0.18;
    const totalPrice = finalPrice + gst;
    
    res.json({
      success: true,
      vehicle: vehicle.name,
      basePrice: `₹${basePrice}/day`,
      multipliers: {
        peakHour: vehicle.peakHourMultiplier,
        demand: multiplier,
      },
      baseCalculatedPrice: `₹${Math.round(demandPrice)}/day`,
      discounts: {
        advanceBooking: advanceDiscount > 0 ? `-${advanceDiscount * 100}%` : 'None',
        rideSharing: rideShareDiscount > 0 ? `-${rideShareDiscount * 100}%` : 'None',
      },
      finalDailyPrice: `₹${Math.round(finalPrice)}/day`,
      gst: `₹${Math.round(gst)} (18%)`,
      totalPrice: `₹${Math.round(totalPrice)}/day`,
      priceBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update demand multiplier for a vehicle
const updateDemandMultiplier = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    
    // Calculate demand based on recent bookings
    const lastWeekBookings = await Booking.countDocuments({
      vehicle: vehicleId,
      bookingDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });
    
    let demandMultiplier = 1.0;
    if (lastWeekBookings > 20) demandMultiplier = 1.5;
    else if (lastWeekBookings > 10) demandMultiplier = 1.2;
    else if (lastWeekBookings < 5) demandMultiplier = 0.8;
    
    await Vehicle.findByIdAndUpdate(vehicleId, {
      demandMultiplier,
      lastPriceUpdate: new Date(),
    });
    
    res.json({ success: true, demandMultiplier });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  calculateSmartPrice,
  updateDemandMultiplier,
};