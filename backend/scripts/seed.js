import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import User from '../src/models/User.js';
import Subject from '../src/models/Subject.js';
import Announcement from '../src/models/Announcement.js';
import Grade from '../src/models/Grade.js';
import Schedule from '../src/models/Schedule.js';
import Enrollment from '../src/models/Enrollment.js';
import Masterlist from '../src/models/Masterlist.js';
import Notification from '../src/models/Notification.js';
import Message from '../src/models/Message.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Subject.deleteMany({});
    await Announcement.deleteMany({});
    await Grade.deleteMany({});
    await Schedule.deleteMany({});
    await Enrollment.deleteMany({});
    await Masterlist.deleteMany({});
    await Notification.deleteMany({});
    await Message.deleteMany({});

    // Create Admin
    console.log('Creating admin user...');
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@sis.com',
      password: 'admin123',
      role: 'Admin',
      status: 'Active',
    });

    // Create Teachers
    console.log('Creating teachers...');
    const teachers = await User.insertMany([
      {
        firstName: 'Hermano',
        lastName: 'Puli',
        email: 'hermano.puli@sis.com',
        password: 'teacher123',
        role: 'Teacher',
        status: 'Active',
      },
      {
        firstName: 'Carla',
        lastName: 'Sainz',
        email: 'carla.sainz@sis.com',
        password: 'teacher123',
        role: 'Teacher',
        status: 'Active',
      },
      {
        firstName: 'Kim',
        lastName: 'Perez',
        email: 'kim.perez@sis.com',
        password: 'teacher123',
        role: 'Teacher',
        status: 'Active',
      },
      {
        firstName: 'Angelica',
        lastName: 'Nanas',
        email: 'angelica.nanas@sis.com',
        password: 'teacher123',
        role: 'Teacher',
        status: 'Active',
      },
    ]);

    // Create Subjects
    console.log('Creating subjects...');
    const subjects = await Subject.insertMany([
      {
        name: 'Mathematics',
        gradeLevel: 7,
        teachers: [teachers[0]._id],
      },
      {
        name: 'Science',
        gradeLevel: 7,
        teachers: [teachers[1]._id],
      },
      {
        name: 'English',
        gradeLevel: 7,
        teachers: [teachers[2]._id],
      },
      {
        name: 'Mathematics',
        gradeLevel: 8,
        teachers: [teachers[0]._id],
      },
      {
        name: 'Science',
        gradeLevel: 8,
        teachers: [teachers[1]._id],
      },
      {
        name: 'English',
        gradeLevel: 8,
        teachers: [teachers[2]._id],
      },
    ]);

    // Update teachers with subjects
    teachers[0].subjects = [subjects[0]._id, subjects[3]._id];
    teachers[1].subjects = [subjects[1]._id, subjects[4]._id];
    teachers[2].subjects = [subjects[2]._id, subjects[5]._id];
    await Promise.all(teachers.map((t) => t.save()));

    // Create Students
    console.log('Creating students...');
    const students = await User.insertMany([
      {
        firstName: 'Kiana Mae',
        lastName: 'Alvarez',
        middleName: 'L.',
        email: 'kiana.alvarez@sis.com',
        password: 'student123',
        role: 'Student',
        status: 'Active',
        learnerReferenceNo: '823194756201',
        grade: 8,
        section: 'Lilac',
      },
      {
        firstName: 'Haven Joy',
        lastName: 'Dayola',
        middleName: 'E.',
        email: 'haven.dayola@sis.com',
        password: 'student123',
        role: 'Student',
        status: 'Active',
        learnerReferenceNo: '823194756202',
        grade: 9,
        section: 'Jasmine',
      },
      {
        firstName: 'Krystoff',
        lastName: 'Morales',
        middleName: 'A.',
        email: 'krystoff.morales@sis.com',
        password: 'student123',
        role: 'Student',
        status: 'Active',
        learnerReferenceNo: '823194756203',
        grade: 8,
        section: 'Lilac',
      },
    ]);

    // Create Masterlist
    console.log('Creating masterlists...');
    await Masterlist.create({
      grade: 8,
      section: 'Lilac',
      students: [students[0]._id, students[2]._id],
      adviser: teachers[3]._id,
      schoolYear: '2025-2026',
    });

    // Create Announcements
    console.log('Creating announcements...');
    await Announcement.insertMany([
      {
        subject: 'School Reopening',
        message:
          'Ang Sto. Niño National High School ay magsasagawa ng Early Registration simula Enero 25, 2025 hanggang Pebrero 28, 2025.',
        sender: admin._id,
        recipient: 'All',
        pinned: true,
        type: 'announcement',
      },
      {
        subject: 'Official List of Grade 7 Students',
        message: 'Official List of Grade 7 Students',
        sender: admin._id,
        recipient: 'All',
        pinned: false,
        type: 'announcement',
      },
    ]);

    // Create Grades
    console.log('Creating grades...');
    await Grade.insertMany([
      {
        student: students[0]._id,
        subject: subjects[3]._id,
        gradeLevel: 8,
        schoolYear: '2025-2026',
        q1: 88,
        q2: 88,
        q3: 88,
        q4: 88,
        status: 'completed',
      },
      {
        student: students[0]._id,
        subject: subjects[4]._id,
        gradeLevel: 8,
        schoolYear: '2025-2026',
        q1: 91,
        q2: 91,
        q3: 91,
        q4: 91,
        status: 'completed',
      },
    ]);

    // Create Notifications
    console.log('Creating notifications...');
    await Notification.insertMany([
      {
        type: 'Enrollment',
        message: '3 Students submitted their documents for enrollment.',
        recipient: admin._id,
        read: false,
      },
      {
        type: 'Message',
        message: 'Ms. Mariah A. Lordez sent a message.',
        recipient: admin._id,
        read: false,
      },
      {
        type: 'Announcement',
        message: 'New announcement posted.',
        recipient: students[0]._id,
        read: false,
      },
    ]);

    // Create Messages
    console.log('Creating messages...');
    await Message.create({
      sender: teachers[0]._id,
      recipient: admin._id,
      subject: 'IMPORTANT',
      message:
        'Greetings, Admin! I have a student named James Trio. He said he already passed the soft copy of his form 138. Can you please check whether he passed it already?',
      read: false,
    });

    console.log('Seed data created successfully!');
    console.log('\nSample credentials:');
    console.log('Admin: admin@sis.com / admin123');
    console.log('Teacher: hermano.puli@sis.com / teacher123');
    console.log('Student: kiana.alvarez@sis.com / student123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

