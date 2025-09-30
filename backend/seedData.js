import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Question from './models/Question.js';
import Interview from './models/Interview.js';
import ChatMessage from './models/ChatMessage.js';
import Resume from './models/Resume.js';

dotenv.config();

const sampleQuestions = [
  {
    text: 'Tell me about yourself and your background.',
    difficulty: 'easy',
    timeLimit: 120
  },
  {
    text: 'What are your greatest strengths as a professional?',
    difficulty: 'easy',
    timeLimit: 120
  },
  {
    text: 'Describe a challenging project you worked on and how you overcame obstacles.',
    difficulty: 'medium',
    timeLimit: 180
  },
  {
    text: 'How do you handle working under pressure and tight deadlines?',
    difficulty: 'medium',
    timeLimit: 180
  },
  {
    text: 'Explain a time when you had to learn a new technology quickly for a project.',
    difficulty: 'hard',
    timeLimit: 240
  }
];

const seedDatabase = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-interviewer';

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      Question.deleteMany({}),
      Interview.deleteMany({}),
      ChatMessage.deleteMany({}),
      Resume.deleteMany({})
    ]);
    console.log('Existing data cleared');
    
    // Insert sample questions
    console.log('Inserting sample questions...');
    const createdQuestions = await Question.insertMany(sampleQuestions);
    console.log(`✓ ${createdQuestions.length} questions seeded`);
    
    console.log('✅ Database seeded successfully!');
    console.log('\nSample data created:');
    console.log(`- ${createdQuestions.length} questions`);
    console.log('\nYou can now start the application and test with this data.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
seedDatabase();
