import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Candidate from './models/Candidate.js';
import Question from './models/Question.js';
import Interview from './models/Interview.js';
import ChatMessage from './models/ChatMessage.js';
import Resume from './models/Resume.js';

dotenv.config();

const sampleCandidates = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-123-4567',
    status: 'pending'
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1-555-987-6543',
    status: 'completed',
    score: 85,
    aiSummary: 'Excellent candidate with strong technical skills and good communication.'
  },
  {
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    phone: '+1-555-456-7890',
    status: 'in-progress'
  }
];

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
      Candidate.deleteMany({}),
      Question.deleteMany({}),
      Interview.deleteMany({}),
      ChatMessage.deleteMany({}),
      Resume.deleteMany({})
    ]);
    console.log('Existing data cleared');
    
    // Insert sample data
    console.log('Inserting sample candidates...');
    const candidates = await Candidate.insertMany(sampleCandidates);
    console.log(`✓ ${candidates.length} candidates seeded`);
    
    // Create sample interview with questions for first candidate
    if (candidates.length > 0) {
      console.log('Creating sample interview...');
      const interview = new Interview({
        candidate: candidates[0]._id,
        questions: [],
        status: 'pending'
      });
      
      // Create questions for the interview
      const questionsWithInterview = sampleQuestions.map(q => ({
        ...q,
        interview: interview._id
      }));
      
      const createdQuestions = await Question.insertMany(questionsWithInterview);
      interview.questions = createdQuestions.map(q => q._id);
      await interview.save();
      
      console.log(`✓ Sample interview created with ${createdQuestions.length} questions`);
    }
    
    console.log('✅ Database seeded successfully!');
    console.log('\nSample data created:');
    console.log(`- ${candidates.length} candidates`);
    console.log(`- ${sampleQuestions.length} questions`);
    console.log('- 1 sample interview');
    console.log('\nYou can now start the application and test with this data.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
seedDatabase();
