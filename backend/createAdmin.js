const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/vehicle_rental');
    console.log('Connected to MongoDB');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@rentwheels.com' });
    
    if (existingAdmin) {
      console.log('Admin already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
    } else {
      // Create admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const admin = new User({
        name: 'Admin User',
        email: 'admin@rentwheels.com',
        password: hashedPassword,
        phone: '9999999999',
        role: 'admin',
        avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=random',
        createdAt: new Date()
      });
      
      await admin.save();
      console.log('✅ Admin user created successfully!');
      console.log('Email: admin@rentwheels.com');
      console.log('Password: admin123');
      console.log('Role: admin');
    }
    
    // Also create a test user if not exists
    const existingTest = await User.findOne({ email: 'test@rentwheels.com' });
    if (!existingTest) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('test123', salt);
      
      const testUser = new User({
        name: 'Test User',
        email: 'test@rentwheels.com',
        password: hashedPassword,
        phone: '8888888888',
        role: 'user',
        avatar: 'https://ui-avatars.com/api/?name=Test+User&background=random',
        createdAt: new Date()
      });
      
      await testUser.save();
      console.log('✅ Test user created successfully!');
      console.log('Email: test@rentwheels.com');
      console.log('Password: test123');
    }
    
    // List all users
    const allUsers = await User.find({}, 'name email role');
    console.log('\n📋 All users in database:');
    allUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin();