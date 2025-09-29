/**
 * Database cleanup script
 * Removes duplicate candidates with placeholder emails
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Candidate from './models/Candidate.js';

// Load environment variables
dotenv.config();

async function cleanupDatabase() {
  try {
    console.log('🧹 Starting database cleanup...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aiinterview');
    console.log('✅ Connected to MongoDB');

    // Remove candidates with placeholder emails
    const placeholderEmails = [
      'candidate@example.com',
      'candidate@email.com',
      'test@example.com'
    ];

    for (const email of placeholderEmails) {
      const result = await Candidate.deleteMany({ email: email });
      console.log(`🗑️  Removed ${result.deletedCount} candidates with email: ${email}`);
    }

    // Remove candidates with "Unknown Candidate" name and placeholder emails
    const unknownCandidates = await Candidate.deleteMany({
      name: 'Unknown Candidate',
      email: { $regex: /^candidate.*@example\.com$/ }
    });
    console.log(`🗑️  Removed ${unknownCandidates.deletedCount} unknown candidates with placeholder emails`);

    // Show remaining candidates
    const remainingCandidates = await Candidate.find({}).select('name email createdAt');
    console.log('\n📋 Remaining candidates:');
    remainingCandidates.forEach((candidate, index) => {
      console.log(`${index + 1}. ${candidate.name} (${candidate.email}) - ${candidate.createdAt}`);
    });

    console.log('\n✅ Database cleanup completed!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run cleanup
cleanupDatabase();
