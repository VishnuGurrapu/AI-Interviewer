/**
 * Test script for OpenAI integration
 * Run this to verify that OpenAI is working correctly
 */

import dotenv from 'dotenv';
import aiService from './services/aiService.js';

dotenv.config();

async function testAIIntegration() {
  console.log('🤖 Testing OpenAI Integration...\n');

  // Test data
  const mockResumeData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-123-4567',
    summary: 'Experienced software developer with 5 years in web development',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Python'],
    experience: [
      {
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
        duration: '2022 - Present'
      }
    ],
    education: [
      {
        institution: 'University of Technology',
        degree: 'Computer Science',
        year: '2019'
      }
    ]
  };

  try {
    // Test 1: Question Generation
    console.log('1️⃣ Testing Question Generation...');
    const questions = await aiService.generateInterviewQuestions(mockResumeData, 'Full Stack Developer');
    console.log(`✅ Generated ${questions.length} questions:`);
    questions.forEach((q, i) => {
      console.log(`   ${i + 1}. [${q.difficulty.toUpperCase()}] ${q.text}`);
    });

    // Test 2: Response Evaluation
    console.log('\n2️⃣ Testing Response Evaluation...');
    const testResponse = "I have been working as a software developer for 5 years, primarily focusing on web applications using JavaScript and React. I've led several projects and enjoy solving complex problems.";
    
    const evaluation = await aiService.evaluateResponse(
      questions[0].text,
      testResponse,
      mockResumeData
    );
    
    console.log(`✅ Evaluation completed:`);
    console.log(`   Score: ${evaluation.score}/10`);
    console.log(`   Feedback: ${evaluation.feedback}`);
    console.log(`   Strengths: ${evaluation.strengths.join(', ')}`);
    console.log(`   Improvements: ${evaluation.improvements.join(', ')}`);

    // Test 3: Interview Summary
    console.log('\n3️⃣ Testing Interview Summary...');
    const mockEvaluations = [
      { score: 8, feedback: 'Great technical knowledge', strengths: ['Technical skills'], improvements: [] },
      { score: 7, feedback: 'Good communication', strengths: ['Communication'], improvements: ['More examples'] },
      { score: 9, feedback: 'Excellent problem solving', strengths: ['Problem solving'], improvements: [] }
    ];

    const summary = await aiService.generateInterviewSummary(mockEvaluations, mockResumeData);
    console.log(`✅ Summary generated:`);
    console.log(`   Final Score: ${summary.finalScore}/100`);
    console.log(`   Summary: ${summary.summary}`);
    console.log(`   Recommendations: ${summary.recommendations.join(', ')}`);

    console.log('\n🎉 All AI tests completed successfully!');
    console.log('\n📝 Notes:');
    console.log('- If you see "mock" responses, your OpenAI API key might not be configured');
    console.log('- Check your .env file for OPENAI_API_KEY or OPEN_APL_KEY');
    console.log('- Make sure you have sufficient OpenAI credits');

  } catch (error) {
    console.error('❌ AI test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your OpenAI API key in .env file');
    console.log('2. Verify you have OpenAI credits available');
    console.log('3. Check your internet connection');
    console.log('4. Ensure the openai package is installed: npm install openai');
  }

  process.exit(0);
}

// Run the test
testAIIntegration();
