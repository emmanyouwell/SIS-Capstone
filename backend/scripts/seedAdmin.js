import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import User from '../src/models/User.js';
import Admin from '../src/models/Admin.js';

dotenv.config();

/**
 * Seed script to create admin accounts
 * Usage: node backend/scripts/seedAdmin.js
 */
const seedAdmin = async () => {
  try {
    await connectDB();

    console.log('🌱 Starting admin seed...\n');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      email: 'admin@sis.com',
      role: 'Admin'
    });

    if (existingAdmin) {
      console.log('⚠️  Admin account already exists: admin@sis.com');
      console.log('   To create a new admin, use a different email or delete the existing one first.\n');
      process.exit(0);
    }

    // ============================================
    // CREATE ADMIN USER
    // ============================================
    console.log('📋 Creating Admin user...');
    
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      middleName: '',
      email: 'admin@sis.com',
      password: 'admin123',
      role: 'Admin',
      status: 'Active',
      contactNumber: '+63 912 345 6789',
      address: '123 Admin Street, Quezon City',
      dateOfBirth: new Date('1980-01-15'),
      sex: 'Male',
      extensionName: '',
    });

    await Admin.create({
      userId: adminUser._id,
      employeeId: 'ADM-001',
      position: 'System Administrator',
      department: 'IT Department',
      assignedOffice: 'Main Office',
    });

    console.log('✅ Admin created successfully!');
    console.log('\n🔑 Login Credentials:');
    console.log('   Email:    admin@sis.com');
    console.log('   Password: admin123');
    console.log('   Employee ID: ADM-001');
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();

