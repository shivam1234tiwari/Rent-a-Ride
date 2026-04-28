const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vehicle_rental')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Connection error:', err));

const users = [
  {
    name: "Admin User",
    email: "admin@rentwheels.com",
    password: "admin123",
    phone: "9999999999",
    role: "admin",
    avatar: "https://ui-avatars.com/api/?name=Admin+User&background=random",
    address: {
      street: "Admin Office",
      city: "Corporate City",
      state: "Corporate State",
      pincode: "000001",
    },
    preferences: {
      preferredVehicleType: ["car", "suv", "luxury"],
      preferredLanguage: "english",
      notificationsEnabled: true,
    },
  },
  {
    name: "Test User",
    email: "test@rentwheels.com",
    password: "test123",
    phone: "8888888888",
    role: "user",
    avatar: "https://ui-avatars.com/api/?name=Test+User&background=random",
    address: {
      street: "Test Street 123",
      city: "Test City",
      state: "Test State",
      pincode: "123456",
    },
    preferences: {
      preferredVehicleType: ["bike", "car"],
      preferredLanguage: "english",
      notificationsEnabled: true,
    },
  },
  {
    name: "John Doe",
    email: "john@example.com",
    password: "john123",
    phone: "7777777777",
    role: "user",
    avatar: "https://ui-avatars.com/api/?name=John+Doe&background=random",
    address: {
      street: "Customer Lane",
      city: "Customer City",
      state: "Customer State",
      pincode: "654321",
    },
    preferences: {
      preferredVehicleType: ["electric", "suv"],
      preferredLanguage: "english",
      notificationsEnabled: true,
    },
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "jane123",
    phone: "6666666666",
    role: "user",
    avatar: "https://ui-avatars.com/api/?name=Jane+Smith&background=random",
    address: {
      street: "Smith Apartments",
      city: "Metro City",
      state: "Metro State",
      pincode: "987654",
    },
    preferences: {
      preferredVehicleType: ["luxury", "self-driving"],
      preferredLanguage: "english",
      notificationsEnabled: true,
    },
  },
  {
    name: "Rahul Verma",
    email: "rahul@example.com",
    password: "rahul123",
    phone: "5555555555",
    role: "user",
    avatar: "https://ui-avatars.com/api/?name=Rahul+Verma&background=random",
    address: {
      street: "Verma Colony",
      city: "Delhi",
      state: "Delhi",
      pincode: "110001",
    },
    preferences: {
      preferredVehicleType: ["bike", "car"],
      preferredLanguage: "hindi",
      notificationsEnabled: true,
    },
  },
];

async function seedUsers() {
  try {
    // Clear existing non-driver, non-admin users (optional)
    await User.deleteMany({ role: 'user' });
    console.log('🗑️ Cleared existing regular users');
    
    // Hash passwords
    for (let user of users) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
    
    // Insert users
    const result = await User.insertMany(users);
    console.log(`✅ Added ${result.length} users successfully!`);
    
    // Display user statistics
    console.log('\n📊 User Statistics:');
    console.log('='.repeat(60));
    result.forEach(user => {
      console.log(`• ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
    // Display credentials
    console.log('\n🔐 Login Credentials:');
    console.log('='.repeat(60));
    console.log('Admin:   admin@rentwheels.com / admin123');
    console.log('Test:    test@rentwheels.com / test123');
    console.log('John:    john@example.com / john123');
    console.log('Jane:    jane@example.com / jane123');
    console.log('Rahul:   rahul@example.com / rahul123');
    
    console.log(`\n✨ Total users in database: ${result.length}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();