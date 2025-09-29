/**
 * Simple API testing script
 * Run this after starting the server to test endpoints
 */

const API_BASE = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health:', healthData);

    // Test candidates endpoint
    console.log('\n2. Testing candidates endpoint...');
    const candidatesResponse = await fetch(`${API_BASE}/candidates`);
    const candidatesData = await candidatesResponse.json();
    console.log(`✅ Candidates: Found ${candidatesData.length} candidates`);

    // Test interviews endpoint
    console.log('\n3. Testing interviews endpoint...');
    const interviewsResponse = await fetch(`${API_BASE}/interviews`);
    const interviewsData = await interviewsResponse.json();
    console.log(`✅ Interviews: Found ${interviewsData.length} interviews`);

    console.log('\n🎉 All API tests passed!');
    console.log('\nNext steps:');
    console.log('1. Start the frontend: cd frontend && npm run dev');
    console.log('2. Visit http://localhost:5173');
    console.log('3. Upload a PDF resume to test the full flow');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('\nMake sure:');
    console.log('1. Backend server is running: cd backend && npm run dev');
    console.log('2. MongoDB is running');
    console.log('3. Database is seeded: npm run seed');
  }
}

// Run tests
testAPI();
