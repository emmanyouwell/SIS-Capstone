/**
 * Migration script to convert old schedule structure to new structure
 * 
 * Old structure: One document per schedule entry (sectionId, subjectId, day, startTime, endTime)
 * New structure: One document per section with array of schedule entries
 * 
 * Usage: node scripts/migrateSchedules.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
import Schedule from '../src/models/Schedule.js';
import '../config/db.js'; // Initialize database connection

const migrateSchedules = async () => {
  try {
    console.log('Starting schedule migration...');

    // Get all old schedule documents
    const oldSchedules = await Schedule.find({}).lean();

    if (oldSchedules.length === 0) {
      console.log('No schedules found to migrate.');
      return;
    }

    console.log(`Found ${oldSchedules.length} old schedule documents.`);

    // Check if any schedules already have the new structure
    const hasNewStructure = oldSchedules.some((s) => s.schedule && Array.isArray(s.schedule));
    const hasOldStructure = oldSchedules.some(
      (s) => s.subjectId && s.day && s.startTime && s.endTime && !s.schedule
    );

    if (hasNewStructure && !hasOldStructure) {
      console.log('Schedules already in new format. No migration needed.');
      return;
    }

    // Group old schedules by sectionId
    const schedulesBySection = {};

    oldSchedules.forEach((schedule) => {
      // Skip if already in new format
      if (schedule.schedule && Array.isArray(schedule.schedule)) {
        return;
      }

      // Skip if missing required fields
      if (!schedule.sectionId || !schedule.subjectId || !schedule.day) {
        console.warn(`Skipping invalid schedule: ${schedule._id}`);
        return;
      }

      const sectionId = schedule.sectionId.toString();

      if (!schedulesBySection[sectionId]) {
        schedulesBySection[sectionId] = [];
      }

      // Create schedule entry
      schedulesBySection[sectionId].push({
        subjectId: schedule.subjectId,
        day: schedule.day,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      });
    });

    console.log(`Grouped into ${Object.keys(schedulesBySection).length} sections.`);

    // Delete all old schedule documents
    console.log('Deleting old schedule documents...');
    await Schedule.deleteMany({});

    // Create new schedule documents
    console.log('Creating new schedule documents...');
    const newSchedules = [];

    for (const [sectionId, scheduleEntries] of Object.entries(schedulesBySection)) {
      try {
        const newSchedule = await Schedule.create({
          sectionId,
          schedule: scheduleEntries,
        });
        newSchedules.push(newSchedule);
        console.log(
          `Created schedule for section ${sectionId} with ${scheduleEntries.length} entries.`
        );
      } catch (error) {
        console.error(`Error creating schedule for section ${sectionId}:`, error.message);
      }
    }

    console.log(`\nMigration completed successfully!`);
    console.log(`Created ${newSchedules.length} new schedule documents.`);
    console.log(`Total schedule entries: ${oldSchedules.length}`);
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

// Run migration
migrateSchedules()
  .then(() => {
    console.log('Migration script finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });

