const mongoose = require('mongoose');
const Vehicle = require('./models/Vehicle');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/vehicle_rental')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Connection error:', err));

// Sample vehicles data
const vehicles = [
  {
    name: "Tesla Model 3",
    brand: "Tesla",
    model: "Model 3",
    year: 2023,
    type: "electric",
    category: "Electric",
    pricePerDay: 120,
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800",
    description: "Experience the future of driving with the Tesla Model 3. Zero emissions, incredible acceleration, and cutting-edge technology.",
    features: ["Autopilot", "Glass Roof", "15-inch Display", "Premium Audio"],
    transmission: "Automatic",
    seats: 5,
    fuelType: "Electric",
    available: true,
    rating: 4.9
  },
  {
    name: "BMW X5",
    brand: "BMW",
    model: "X5",
    year: 2023,
    type: "suv",
    category: "SUV",
    pricePerDay: 150,
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
    description: "Luxury meets performance. The BMW X5 offers unparalleled comfort and driving dynamics.",
    features: ["Leather Seats", "Panoramic Roof", "Harman Kardon Sound", "Wireless Charging"],
    transmission: "Automatic",
    seats: 5,
    fuelType: "Petrol",
    available: true,
    rating: 4.8
  },
  {
    name: "Harley Davidson Street Glide",
    brand: "Harley-Davidson",
    model: "Street Glide",
    year: 2023,
    type: "bike",
    category: "Cruiser",
    pricePerDay: 80,
    image: "https://images.unsplash.com/photo-1589106593505-9bf2e9ad8d6c?w=800",
    description: "Feel the freedom of the open road on this iconic American motorcycle.",
    features: ["ABS", "Cruise Control", "Premium Sound System", "Saddlebags"],
    transmission: "Manual",
    seats: 2,
    fuelType: "Petrol",
    available: true,
    rating: 4.7
  },
  {
    name: "Mercedes-Benz S-Class",
    brand: "Mercedes-Benz",
    model: "S-Class",
    year: 2023,
    type: "luxury",
    category: "Luxury",
    pricePerDay: 200,
    image: "https://images.unsplash.com/photo-1621135802920-133df287f89c?w=800",
    description: "The pinnacle of automotive luxury. Experience unmatched comfort and cutting-edge technology.",
    features: ["Massage Seats", "Burmester Audio", "Air Suspension", "Rear Entertainment"],
    transmission: "Automatic",
    seats: 5,
    fuelType: "Petrol",
    available: true,
    rating: 4.9
  },
  {
    name: "Toyota Camry",
    brand: "Toyota",
    model: "Camry",
    year: 2023,
    type: "car",
    category: "Sedan",
    pricePerDay: 65,
    image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
    description: "Reliable, comfortable, and fuel-efficient. Perfect for daily commuting and road trips.",
    features: ["Lane Departure Alert", "Adaptive Cruise Control", "Apple CarPlay", "Android Auto"],
    transmission: "Automatic",
    seats: 5,
    fuelType: "Petrol",
    available: true,
    rating: 4.6
  },
  {
    name: "Honda Civic",
    brand: "Honda",
    model: "Civic",
    year: 2023,
    type: "car",
    category: "Sedan",
    pricePerDay: 60,
    image: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800",
    description: "Sporty, efficient, and fun to drive. The Honda Civic delivers exceptional value.",
    features: ["Honda Sensing", "Blind Spot Monitoring", "Sunroof", "Heated Seats"],
    transmission: "Automatic",
    seats: 5,
    fuelType: "Petrol",
    available: true,
    rating: 4.7
  },
  {
    name: "Ford Mustang",
    brand: "Ford",
    model: "Mustang",
    year: 2023,
    type: "car",
    category: "Sports",
    pricePerDay: 180,
    image: "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=800",
    description: "Iconic American muscle car with powerful performance and head-turning style.",
    features: ["V8 Engine", "Track Apps", "Launch Control", "Premium Sound"],
    transmission: "Automatic",
    seats: 4,
    fuelType: "Petrol",
    available: true,
    rating: 4.8
  },
  {
    name: "Audi Q7",
    brand: "Audi",
    model: "Q7",
    year: 2023,
    type: "suv",
    category: "Luxury SUV",
    pricePerDay: 170,
    image: "https://images.unsplash.com/photo-1606664512736-37c1ab4a4a2f?w=800",
    description: "Spacious luxury SUV with Quattro all-wheel drive and advanced technology.",
    features: ["Virtual Cockpit", "Bang & Olufsen Sound", "Ambient Lighting", "Air Suspension"],
    transmission: "Automatic",
    seats: 7,
    fuelType: "Petrol",
    available: true,
    rating: 4.8
  },
  {
    name: "Nissan Leaf",
    brand: "Nissan",
    model: "Leaf",
    year: 2023,
    type: "electric",
    category: "Electric",
    pricePerDay: 85,
    image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800",
    description: "Affordable electric vehicle perfect for city driving. Zero emissions, low running costs.",
    features: ["e-Pedal", "ProPILOT Assist", "Quick Charge", "Eco Mode"],
    transmission: "Automatic",
    seats: 5,
    fuelType: "Electric",
    available: true,
    rating: 4.5
  },
  {
    name: "Yamaha R1",
    brand: "Yamaha",
    model: "R1",
    year: 2023,
    type: "bike",
    category: "Sport Bike",
    pricePerDay: 100,
    image: "https://images.unsplash.com/photo-1558981808-62c9f1cb31b8?w=800",
    description: "Ultimate sportbike experience with race-ready performance and advanced electronics.",
    features: ["Quick Shifter", "Traction Control", "ABS", "Launch Control"],
    transmission: "Manual",
    seats: 2,
    fuelType: "Petrol",
    available: true,
    rating: 4.9
  }
];

async function seedDatabase() {
  try {
    // Clear existing vehicles
    await Vehicle.deleteMany();
    console.log('Cleared existing vehicles');
    
    // Insert new vehicles
    const result = await Vehicle.insertMany(vehicles);
    console.log(`✅ Successfully added ${result.length} vehicles to the database!`);
    
    // Display the vehicles
    console.log('\n📋 Added vehicles:');
    result.forEach(vehicle => {
      console.log(`- ${vehicle.name}: $${vehicle.pricePerDay}/day (${vehicle.type})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();