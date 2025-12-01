import mongoose from 'mongoose';
import Grade from '../src/models/Grade.js';
import User from '../src/models/User.js';
import Subject from '../src/models/Subject.js';
import { connectDB } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const seedGrades = async () => {
  try {
    await connectDB();
    console.log('Seeding grades...');

    const students = await User.find({ role: 'Student' });

    if (students.length === 0) {
      throw new Error('No students found. Seed them first.');
    }

    await Grade.deleteMany();
    const payload = [];

    for (const student of students) {
      const gradeLevel = student.grade; // <-- FIX

      const subjects = await Subject.find({ gradeLevel });

      if (subjects.length === 0) {
        console.log(
          `⚠️  No subjects found for gradeLevel ${gradeLevel}. Skipping student ${student._id}`
        );
        continue;
      }

      const subjectGrades = subjects.map((subj) => ({
        subject: subj._id,
        q1: Math.floor(Math.random() * 41) + 60,
        q2: Math.floor(Math.random() * 41) + 60,
        q3: Math.floor(Math.random() * 41) + 60,
        q4: Math.floor(Math.random() * 41) + 60,
      }));

      const finalGrade =
        subjectGrades.reduce((sum, s) => sum + (s.q1 + s.q2 + s.q3 + s.q4) / 4, 0) /
        subjectGrades.length;

      const status =
        finalGrade >= 75 ? 'completed' : finalGrade >= 60 ? 'incomplete' : 'failed';

      payload.push({
        student: student._id,
        gradeLevel,
        schoolYear: '2024-2025',
        grades: { subjects: subjectGrades },
        finalGrade: Math.round(finalGrade),
        status,
        remarks: finalGrade >= 75 ? 'Passed' : 'Needs improvement',
      });
    }

    await Grade.insertMany(payload);

    console.log(`Grades seeded: ${payload.length}`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding grades:', error.message);
    process.exit(1);
  }
};

seedGrades();
