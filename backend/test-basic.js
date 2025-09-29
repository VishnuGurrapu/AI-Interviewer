/**
 * Basic server test - minimal version to check if core components work
 */

console.log('🧪 Testing basic server components...\n');

try {
  // Test 1: Basic imports
  console.log('1. Testing basic imports...');
  
  const express = (await import('express')).default;
  console.log('✅ Express imported');
  
  const mongoose = (await import('mongoose')).default;
  console.log('✅ Mongoose imported');
  
  const cors = (await import('cors')).default;
  console.log('✅ CORS imported');
  
  const dotenv = (await import('dotenv')).default;
  console.log('✅ Dotenv imported');

  // Test 2: Create basic app
  console.log('\n2. Creating basic Express app...');
  const app = express();
  app.use(cors());
  app.use(express.json());
  
  app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!' });
  });
  
  console.log('✅ Express app created');

  // Test 3: Try to start server briefly
  console.log('\n3. Testing server startup...');
  const server = app.listen(5001, () => {
    console.log('✅ Server started on port 5001');
    server.close(() => {
      console.log('✅ Server stopped successfully');
      console.log('\n🎉 Basic server test PASSED!');
      console.log('The issue is likely in one of the custom modules.');
      process.exit(0);
    });
  });

} catch (error) {
  console.log('❌ Basic server test FAILED!');
  console.log('Error:', error.message);
  console.log('Stack:', error.stack);
  process.exit(1);
}
