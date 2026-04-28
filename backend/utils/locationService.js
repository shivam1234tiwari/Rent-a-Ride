// Calculate distance between two coordinates in kilometers (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Get estimated travel time
const getEstimatedTravelTime = (distance, avgSpeed = 40) => {
  const hours = distance / avgSpeed;
  return {
    hours: Math.floor(hours),
    minutes: Math.round((hours % 1) * 60),
    totalMinutes: Math.round(hours * 60),
  };
};

// Validate Indian phone number
const validateIndianPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// Format Indian currency (₹)
const formatIndianCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format number with Indian comma system (e.g., 1,00,000)
const formatIndianNumber = (number) => {
  return new Intl.NumberFormat('en-IN').format(number);
};

// Calculate distance matrix for multiple points
const calculateDistanceMatrix = (origins, destinations) => {
  const matrix = [];
  for (let i = 0; i < origins.length; i++) {
    matrix[i] = [];
    for (let j = 0; j < destinations.length; j++) {
      const distance = calculateDistance(
        origins[i].lat, origins[i].lng,
        destinations[j].lat, destinations[j].lng
      );
      matrix[i][j] = {
        distance: Math.round(distance * 10) / 10,
        travelTime: getEstimatedTravelTime(distance),
      };
    }
  }
  return matrix;
};

// Geocode address (mock - in production use Google Maps API)
const geocodeAddress = async (address) => {
  // This is a mock function. In production, use Google Maps Geocoding API
  const mockCoordinates = {
    lat: 28.6139 + (Math.random() - 0.5) * 0.1,
    lng: 77.2090 + (Math.random() - 0.5) * 0.1,
  };
  return mockCoordinates;
};

// Reverse geocode (mock - in production use Google Maps API)
const reverseGeocode = async (lat, lng) => {
  // This is a mock function. In production, use Google Maps Reverse Geocoding API
  return {
    street: "Sample Street",
    city: "Sample City",
    state: "Sample State",
    pincode: "123456",
    fullAddress: `${lat}, ${lng}`,
  };
};

// Check if coordinates are within a radius
const isWithinRadius = (lat1, lon1, lat2, lon2, radiusKm) => {
  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  return distance <= radiusKm;
};

// Get nearest location from a list
const getNearestLocation = (currentLat, currentLng, locations) => {
  let nearest = null;
  let minDistance = Infinity;
  
  for (const location of locations) {
    const distance = calculateDistance(
      currentLat, currentLng,
      location.lat, location.lng
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearest = location;
    }
  }
  
  return { nearest, distance: minDistance };
};

// Calculate fare based on distance and vehicle type
const calculateFare = (distance, vehicleType, isPeakHour = false, isNightHour = false) => {
  let baseFare = 0;
  const perKmRate = {
    bike: 8,
    car: 12,
    suv: 15,
    luxury: 25,
    electric: 10,
    truck: 20,
    'self-driving': 18,
  };
  
  baseFare = distance * (perKmRate[vehicleType] || 12);
  
  // Peak hour multiplier (6-9 PM)
  if (isPeakHour) {
    baseFare *= 1.3;
  }
  
  // Night hour multiplier (10 PM - 6 AM)
  if (isNightHour) {
    baseFare *= 1.2;
  }
  
  // Round to nearest integer
  return Math.round(baseFare);
};

// Get current time slot for pricing
const getTimeSlot = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour <= 9) return 'morning-peak';
  if (hour >= 17 && hour <= 20) return 'evening-peak';
  if (hour >= 22 || hour <= 5) return 'night';
  return 'normal';
};

module.exports = {
  calculateDistance,
  getEstimatedTravelTime,
  validateIndianPhone,
  formatIndianCurrency,
  formatIndianNumber,
  calculateDistanceMatrix,
  geocodeAddress,
  reverseGeocode,
  isWithinRadius,
  getNearestLocation,
  calculateFare,
  getTimeSlot,
};