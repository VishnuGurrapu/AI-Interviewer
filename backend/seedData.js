import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Candidate from './models/Candidate.js';
import Interview from './models/Interview.js';

dotenv.config();

const seedData = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-interviewer';

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Candidate.deleteMany({});
    await Interview.deleteMany({});
    console.log('Cleared existing data.');

    // Create candidates
    const candidates = await Candidate.insertMany([
      { name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '555-0101', score: 87, status: 'completed' },
      { name: 'Michael Chen', email: 'michael.chen@email.com', phone: '555-0102', score: 72, status: 'completed' },
      { name: 'Emily Rodriguez', email: 'emily.r@email.com', phone: '555-0103', score: 94, status: 'completed' },
      { name: 'David Kim', email: 'david.kim@email.com', phone: '555-0104', score: 56, status: 'completed' },
    ]);
    console.log(`${candidates.length} candidates created.`);

    // Create interviews for each candidate
    const interviews = [];
    for (const candidate of candidates) {
      interviews.push({
        candidate: candidate._id,
        score: candidate.score,
        status: 'completed',
        createdAt: new Date(`2024-01-${Math.floor(Math.random() * 10) + 10}`),
        completedAt: new Date(`2024-01-${Math.floor(Math.random() * 10) + 15}`),
      });
    }

    await Interview.insertMany(interviews);
    console.log(`${interviews.length} interviews created.`);

    console.log('Database seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
};

seedData();
