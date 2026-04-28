const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vehicle_rental')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Connection error:', err));

const drivers = [
  {
    name: "Rajesh Kumar",
    email: "rajesh@rentwheels.com",
    password: "driver123",
    phone: "9876543210",
    role: "driver",
    avatar: "https://ui-avatars.com/api/?name=Rajesh+Kumar&background=random",
    address: {
      street: "123 MG Road",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
    },
    driverProfile: {
      licenseNumber: "MH-01-2023-123456",
      experience: 5,
      rating: 4.8,
      totalTrips: 1250,
      completedTrips: 1200,
      cancelledTrips: 50,
      availability: true,
      currentLocation: {
        lat: 19.0760,
        lng: 72.8777,
      },
      earnings: 45000,
      joinDate: new Date('2020-01-15'),
      documents: {
        aadharCard: "proofs/aadhar_rajesh.pdf",
        panCard: "proofs/pan_rajesh.pdf",
        drivingLicense: "proofs/license_rajesh.pdf",
      },
    },
    preferences: {
      preferredLanguage: "hindi",
      preferredVehicleType: ["car", "suv"],
      notificationsEnabled: true,
    },
  },
  {
    name: "Priya Sharma",
    email: "priya@rentwheels.com",
    password: "driver123",
    phone: "9876543211",
    role: "driver",
    avatar: "https://ui-avatars.com/api/?name=Priya+Sharma&background=random",
    address: {
      street: "456 Park Street",
      city: "Delhi",
      state: "Delhi",
      pincode: "110001",
    },
    driverProfile: {
      licenseNumber: "DL-2023-789012",
      experience: 3,
      rating: 4.9,
      totalTrips: 850,
      completedTrips: 830,
      cancelledTrips: 20,
      availability: true,
      currentLocation: {
        lat: 28.6139,
        lng: 77.2090,
      },
      earnings: 35000,
      joinDate: new Date('2021-06-20'),
      documents: {
        aadharCard: "proofs/aadhar_priya.pdf",
        panCard: "proofs/pan_priya.pdf",
        drivingLicense: "proofs/license_priya.pdf",
      },
    },
    preferences: {
      preferredLanguage: "english",
      preferredVehicleType: ["luxury", "electric"],
      notificationsEnabled: true,
    },
  },
  {
    name: "Amit Singh",
    email: "amit@rentwheels.com",
    password: "driver123",
    phone: "9876543212",
    role: "driver",
    avatar: "https://ui-avatars.com/api/?name=Amit+Singh&background=random",
    address: {
      street: "789 Brigade Road",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560001",
    },
    driverProfile: {
      licenseNumber: "KA-05-2023-345678",
      experience: 7,
      rating: 4.7,
      totalTrips: 2000,
      completedTrips: 1950,
      cancelledTrips: 50,
      availability: true,
      currentLocation: {
        lat: 12.9716,
        lng: 77.5946,
      },
      earnings: 55000,
      joinDate: new Date('2018-03-10'),
      documents: {
        aadharCard: "proofs/aadhar_amit.pdf",
        panCard: "proofs/pan_amit.pdf",
        drivingLicense: "proofs/license_amit.pdf",
      },
    },
    preferences: {
      preferredLanguage: "hindi",
      preferredVehicleType: ["truck", "suv"],
      notificationsEnabled: true,
    },
  },
  {
    name: "Sunita Reddy",
    email: "sunita@rentwheels.com",
    password: "driver123",
    phone: "9876543213",
    role: "driver",
    avatar: "https://ui-avatars.com/api/?name=Sunita+Reddy&background=random",
    address: {
      street: "321 Jubilee Hills",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500033",
    },
    driverProfile: {
      licenseNumber: "TG-09-2023-901234",
      experience: 4,
      rating: 4.9,
      totalTrips: 600,
      completedTrips: 590,
      cancelledTrips: 10,
      availability: true,
      currentLocation: {
        lat: 17.3850,
        lng: 78.4867,
      },
      earnings: 40000,
      joinDate: new Date('2021-12-05'),
      documents: {
        aadharCard: "proofs/aadhar_sunita.pdf",
        panCard: "proofs/pan_sunita.pdf",
        drivingLicense: "proofs/license_sunita.pdf",
      },
    },
    preferences: {
      preferredLanguage: "telugu",
      preferredVehicleType: ["car", "electric"],
      notificationsEnabled: true,
    },
  },
  {
    name: "Vikram Mehta",
    email: "vikram@rentwheels.com",
    password: "driver123",
    phone: "9876543214",
    role: "driver",
    avatar: "https://ui-avatars.com/api/?name=Vikram+Mehta&background=random",
    address: {
      street: "567 Law Garden",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380006",
    },
    driverProfile: {
      licenseNumber: "GJ-01-2023-567890",
      experience: 6,
      rating: 4.8,
      totalTrips: 1500,
      completedTrips: 1450,
      cancelledTrips: 50,
      availability: true,
      currentLocation: {
        lat: 23.0225,
        lng: 72.5714,
      },
      earnings: 50000,
      joinDate: new Date('2019-08-22'),
      documents: {
        aadharCard: "proofs/aadhar_vikram.pdf",
        panCard: "proofs/pan_vikram.pdf",
        drivingLicense: "proofs/license_vikram.pdf",
      },
    },
    preferences: {
      preferredLanguage: "gujarati",
      preferredVehicleType: ["luxury", "self-driving"],
      notificationsEnabled: true,
    },
  },
];

async function seedDrivers() {
  try {
    // Clear existing drivers (optional - only delete drivers, not all users)
    await User.deleteMany({ role: 'driver' });
    console.log('🗑️ Cleared existing drivers');
    
    // Hash passwords
    for (let driver of drivers) {
      const salt = await bcrypt.genSalt(10);
      driver.password = await bcrypt.hash(driver.password, salt);
    }
    
    // Insert drivers
    const result = await User.insertMany(drivers);
    console.log(`✅ Added ${result.length} drivers successfully!`);
    
    // Display driver statistics
    console.log('\n📊 Driver Statistics:');
    console.log('='.repeat(60));
    result.forEach(driver => {
      console.log(`• ${driver.name}: ${driver.driverProfile.experience} years exp, ⭐ ${driver.driverProfile.rating}`);
    });
    
    console.log(`\n✨ Total drivers in database: ${result.length}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding drivers:', error);
    process.exit(1);
  }
}

seedDrivers();