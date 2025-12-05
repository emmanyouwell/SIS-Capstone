import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import User from '../src/models/User.js';
import Student from '../src/models/Student.js';
import Teacher from '../src/models/Teacher.js';
import Admin from '../src/models/Admin.js';

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDB();

    console.log('🌱 Starting user seed...\n');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('Clearing existing user data...');
    await Student.deleteMany({});
    await Teacher.deleteMany({});
    await Admin.deleteMany({});
    await User.deleteMany({});

    // ============================================
    // CREATE ADMIN USERS
    // ============================================
    console.log('\n📋 Creating Admin users...');
    
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
    });

    await Admin.create({
      userId: adminUser._id,
      employeeId: 'ADM-001',
      position: 'System Administrator',
      department: 'IT Department',
      assignedOffice: 'Main Office',
    });

    console.log('✅ Admin created: admin@sis.com / admin123');

    // ============================================
    // CREATE TEACHER USERS
    // ============================================
    console.log('\n👨‍🏫 Creating Teacher users...');

    const teacherUsers = await User.insertMany([
      {
        firstName: 'Hermano',
        lastName: 'Puli',
        middleName: 'M.',
        email: 'hermano.puli@sis.com',
        password: 'teacher123',
        role: 'Teacher',
        status: 'Active',
        contactNumber: '+63 923 456 7890',
        address: '456 Teacher Avenue, Manila',
        dateOfBirth: new Date('1985-05-20'),
      },
      {
        firstName: 'Carla',
        lastName: 'Sainz',
        middleName: 'R.',
        email: 'carla.sainz@sis.com',
        password: 'teacher123',
        role: 'Teacher',
        status: 'Active',
        contactNumber: '+63 934 567 8901',
        address: '789 Educator Road, Makati',
        dateOfBirth: new Date('1988-08-12'),
      },
      {
        firstName: 'Kim',
        lastName: 'Perez',
        middleName: 'L.',
        email: 'kim.perez@sis.com',
        password: 'teacher123',
        role: 'Teacher',
        status: 'Active',
        contactNumber: '+63 945 678 9012',
        address: '321 Instructor Lane, Pasig',
        dateOfBirth: new Date('1990-03-25'),
      },
      {
        firstName: 'Angelica',
        lastName: 'Nanas',
        middleName: 'S.',
        email: 'angelica.nanas@sis.com',
        password: 'teacher123',
        role: 'Teacher',
        status: 'Active',
        contactNumber: '+63 956 789 0123',
        address: '654 Faculty Street, Taguig',
        dateOfBirth: new Date('1987-11-08'),
      },
    ]);

    await Teacher.insertMany([
      {
        userId: teacherUsers[0]._id,
        employeeId: 'TCH-001',
        department: 'Mathematics',
        position: 'Senior Teacher',
        teachingLoad: 4,
        emergencyContactName: 'Maria Puli',
        emergencyContactNumber: '+63 912 345 6789',
      },
      {
        userId: teacherUsers[1]._id,
        employeeId: 'TCH-002',
        department: 'Science',
        position: 'Teacher',
        teachingLoad: 3,
        emergencyContactName: 'Juan Sainz',
        emergencyContactNumber: '+63 923 456 7890',
      },
      {
        userId: teacherUsers[2]._id,
        employeeId: 'TCH-003',
        department: 'English',
        position: 'Teacher',
        teachingLoad: 4,
        emergencyContactName: 'Ana Perez',
        emergencyContactNumber: '+63 934 567 8901',
      },
      {
        userId: teacherUsers[3]._id,
        employeeId: 'TCH-004',
        department: 'Social Studies',
        position: 'Adviser',
        teachingLoad: 2,
        emergencyContactName: 'Pedro Nanas',
        emergencyContactNumber: '+63 945 678 9012',
      },
    ]);

    console.log('✅ Teachers created:');
    teacherUsers.forEach((teacher, index) => {
      console.log(`   ${index + 1}. ${teacher.email} / teacher123`);
    });

    // ============================================
    // CREATE STUDENT USERS
    // ============================================
    console.log('\n🎓 Creating Student users...');

    const studentUsers = await User.insertMany([
      {
        firstName: 'Kiana Mae',
        lastName: 'Alvarez',
        middleName: 'L.',
        email: 'kiana.alvarez@sis.com',
        password: 'student123',
        role: 'Student',
        status: 'Active',
        contactNumber: '+63 967 890 1234',
        address: '123 Student Street, Quezon City',
        dateOfBirth: new Date('2010-06-15'),
      },
      {
        firstName: 'Haven Joy',
        lastName: 'Dayola',
        middleName: 'E.',
        email: 'haven.dayola@sis.com',
        password: 'student123',
        role: 'Student',
        status: 'Active',
        contactNumber: '+63 978 901 2345',
        address: '456 Learner Avenue, Manila',
        dateOfBirth: new Date('2009-09-22'),
      },
      {
        firstName: 'Krystoff',
        lastName: 'Morales',
        middleName: 'A.',
        email: 'krystoff.morales@sis.com',
        password: 'student123',
        role: 'Student',
        status: 'Active',
        contactNumber: '+63 989 012 3456',
        address: '789 Scholar Road, Makati',
        dateOfBirth: new Date('2010-04-10'),
      },
      {
        firstName: 'Maria',
        lastName: 'Santos',
        middleName: 'C.',
        email: 'maria.santos@sis.com',
        password: 'student123',
        role: 'Student',
        status: 'Active',
        contactNumber: '+63 990 123 4567',
        address: '321 Pupil Lane, Pasig',
        dateOfBirth: new Date('2009-12-05'),
      },
      {
        firstName: 'John',
        lastName: 'Dela Cruz',
        middleName: 'M.',
        email: 'john.delacruz@sis.com',
        password: 'student123',
        role: 'Student',
        status: 'Active',
        contactNumber: '+63 901 234 5678',
        address: '654 Student Street, Taguig',
        dateOfBirth: new Date('2010-08-18'),
      },
    ]);

    await Student.insertMany([
      {
        userId: studentUsers[0]._id,
        lrn: '823194756201',
        gradeLevel: 8,
        guardianName: 'Rosa Alvarez',
        guardianContact: '+63 912 345 6789',
      },
      {
        userId: studentUsers[1]._id,
        lrn: '823194756202',
        gradeLevel: 9,
        guardianName: 'Elena Dayola',
        guardianContact: '+63 923 456 7890',
      },
      {
        userId: studentUsers[2]._id,
        lrn: '823194756203',
        gradeLevel: 8,
        guardianName: 'Antonio Morales',
        guardianContact: '+63 934 567 8901',
      },
      {
        userId: studentUsers[3]._id,
        lrn: '823194756204',
        gradeLevel: 9,
        guardianName: 'Carmen Santos',
        guardianContact: '+63 945 678 9012',
      },
      {
        userId: studentUsers[4]._id,
        lrn: '823194756205',
        gradeLevel: 7,
        guardianName: 'Manuel Dela Cruz',
        guardianContact: '+63 956 789 0123',
      },
    ]);

    console.log('✅ Students created:');
    studentUsers.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.email} / student123`);
    });

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(50));
    console.log('✅ Seed completed successfully!');
    console.log('='.repeat(50));
    console.log('\n📊 Summary:');
    console.log(`   • Admin users: 1`);
    console.log(`   • Teacher users: ${teacherUsers.length}`);
    console.log(`   • Student users: ${studentUsers.length}`);
    console.log(`   • Total users: ${1 + teacherUsers.length + studentUsers.length}`);
    console.log('\n🔑 Sample Login Credentials:');
    console.log('   Admin:   admin@sis.com / admin123');
    console.log('   Teacher: hermano.puli@sis.com / teacher123');
    console.log('   Student: kiana.alvarez@sis.com / student123');
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();

