const User = require('../models/User');
const DriverRecommendation = require('../models/DriverRecommendation');

// Smart driver recommendation based on multiple factors
const recommendDrivers = async (req, res) => {
  try {
    const { pickupLocation, dropoffLocation, vehicleType, userPreferences } = req.body;
    
    // Find available drivers
    let availableDrivers = await User.find({
      role: 'driver',
      'driverProfile.availability': true,
      'driverProfile.vehicleAssigned': { $ne: null },
    }).populate('driverProfile.vehicleAssigned');
    
    // Calculate score for each driver
    const scoredDrivers = availableDrivers.map(driver => {
      let score = 0;
      
      // Factor 1: Rating (30% weight)
      const ratingScore = (driver.driverProfile.rating / 5) * 30;
      score += ratingScore;
      
      // Factor 2: Past behavior / Completion rate (25% weight)
      const completionRate = driver.driverProfile.completedTrips / 
        (driver.driverProfile.totalTrips || 1);
      const completionScore = completionRate * 25;
      score += completionScore;
      
      // Factor 3: Distance (25% weight)
      let distanceScore = 25;
      if (pickupLocation && driver.driverProfile.currentLocation) {
        const distance = calculateDistance(
          pickupLocation,
          driver.driverProfile.currentLocation
        );
        // Closer drivers get higher score
        distanceScore = Math.max(0, 25 - (distance / 10));
      }
      score += distanceScore;
      
      // Factor 4: Experience (20% weight)
      const experienceScore = Math.min(20, (driver.driverProfile.experience / 10) * 20);
      score += experienceScore;
      
      // Factor 5: User preferences
      if (userPreferences?.preferredLanguage === driver.preferences?.preferredLanguage) {
        score += 5;
      }
      
      return {
        driver,
        score: Math.round(score),
        rating: driver.driverProfile.rating,
        experience: driver.driverProfile.experience,
        distance: calculateDistance(pickupLocation, driver.driverProfile.currentLocation),
        completionRate: Math.round(completionRate * 100),
      };
    });
    
    // Sort by score and get top 5
    const topDrivers = scoredDrivers
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    // Save recommendation
    const recommendation = await DriverRecommendation.create({
      booking: req.body.bookingId,
      user: req.user.id,
      recommendedDrivers: topDrivers,
      algorithmVersion: '1.0',
    });
    
    res.json({
      success: true,
      recommendations: topDrivers,
      recommendationId: recommendation._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Select a driver from recommendations
const selectDriver = async (req, res) => {
  try {
    const { recommendationId, driverId, bookingId } = req.body;
    
    // Update recommendation
    await DriverRecommendation.findByIdAndUpdate(recommendationId, {
      selectedDriver: driverId,
    });
    
    // Update booking with selected driver
    const booking = await require('../models/Booking').findByIdAndUpdate(
      bookingId,
      {
        driver: driverId,
        status: 'driver-assigned',
      },
      { new: true }
    );
    
    // Update driver availability
    await User.findByIdAndUpdate(driverId, {
      'driverProfile.availability': false,
    });
    
    res.json({
      success: true,
      message: 'Driver assigned successfully',
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Calculate distance between two points (in km)
function calculateDistance(point1, point2) {
  if (!point1 || !point2) return 100; // Default distance if no location
  
  const R = 6371; // Earth's radius in km
  const lat1 = point1.lat * Math.PI / 180;
  const lat2 = point2.lat * Math.PI / 180;
  const deltaLat = (point2.lat - point1.lat) * Math.PI / 180;
  const deltaLon = (point2.lng - point1.lng) * Math.PI / 180;
  
  const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c;
}

// Update driver location for live tracking
const updateDriverLocation = async (req, res) => {
  try {
    const { lat, lng, bookingId } = req.body;
    
    await User.findByIdAndUpdate(req.user.id, {
      'driverProfile.currentLocation': { lat, lng },
    });
    
    await require('../models/Booking').findByIdAndUpdate(bookingId, {
      'liveTracking.currentLocation': { lat, lng },
      'liveTracking.lastUpdate': new Date(),
    });
    
    res.json({ success: true, message: 'Location updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  recommendDrivers,
  selectDriver,
  updateDriverLocation,
};