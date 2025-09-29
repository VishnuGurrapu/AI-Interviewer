/**
 * Quick Backend Diagnostic Tool
 * Run this to identify why the backend is crashing
 */

console.log('🔍 Starting Backend Diagnostics...\n');

// Test 1: Basic Node.js modules
console.log('1. Testing basic imports...');
try {
  const express = await import('express');
  console.log('✅ Express imported successfully');
} catch (error) {
  console.log('❌ Express import failed:', error.message);
  process.exit(1);
}

try {
  const mongoose = await import('mongoose');
  console.log('✅ Mongoose imported successfully');
} catch (error) {
  console.log('❌ Mongoose import failed:', error.message);
  process.exit(1);
}

// Test 2: Environment variables
console.log('\n2. Testing environment variables...');
try {
  const dotenv = await import('dotenv');
  dotenv.config();
  console.log('✅ Dotenv loaded successfully');
  
  if (process.env.MONGODB_URI) {
    console.log('✅ MONGODB_URI found');
  } else {
    console.log('⚠️ MONGODB_URI not found, will use default');
  }
  
  if (process.env.OPENAI_API_KEY || process.env.OPEN_APL_KEY) {
    console.log('✅ OpenAI API key found');
  } else {
    console.log('⚠️ OpenAI API key not found, will use mock responses');
  }
} catch (error) {
  console.log('❌ Environment setup failed:', error.message);
}

// Test 3: Custom modules
console.log('\n3. Testing custom modules...');
try {
  const routes = await import('./routes/index.js');
  console.log('✅ Routes imported successfully');
} catch (error) {
  console.log('❌ Routes import failed:', error.message);
  console.log('   Check routes/index.js for syntax errors');
}

try {
  const errorHandler = await import('./middleware/errorHandler.js');
  console.log('✅ Error handler imported successfully');
} catch (error) {
  console.log('❌ Error handler import failed:', error.message);
  console.log('   Check middleware/errorHandler.js');
}

// Test 4: AI Service (most likely culprit)
console.log('\n4. Testing AI Service...');
try {
  const aiService = await import('./services/aiService.js');
  console.log('✅ AI Service imported successfully');
} catch (error) {
  console.log('❌ AI Service import failed:', error.message);
  console.log('   This is likely the cause of the crash');
  console.log('   Error details:', error.stack);
}

// Test 5: OpenAI package specifically
console.log('\n5. Testing OpenAI package...');
try {
  const openai = await import('openai');
  console.log('✅ OpenAI package imported successfully');
} catch (error) {
  console.log('⚠️ OpenAI package not installed or failed to import');
  console.log('   Run: npm install openai');
  console.log('   Error:', error.message);
}

console.log('\n🎯 Diagnosis Complete!');
console.log('\nIf you see any ❌ errors above, those are likely causing the crash.');
console.log('Most common fixes:');
console.log('1. Run: npm install');
console.log('2. Run: npm install openai');
console.log('3. Check your .env file exists');
console.log('4. Check for syntax errors in the files mentioned above');

process.exit(0);
