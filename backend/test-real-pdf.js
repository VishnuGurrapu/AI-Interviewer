/**
 * Test real PDF parsing functionality
 */

import { safeExtractResumeData } from './utils/safePdfParser.js';
import fs from 'fs';

async function testRealPDFParsing() {
  console.log('🧪 Testing Real PDF Parsing...\n');

  // Check if there are any uploaded resumes to test with
  const uploadsDir = './uploads/resumes';
  
  if (!fs.existsSync(uploadsDir)) {
    console.log('❌ No uploads directory found. Upload a resume first.');
    return;
  }

  const files = fs.readdirSync(uploadsDir).filter(file => file.endsWith('.pdf'));
  
  if (files.length === 0) {
    console.log('❌ No PDF files found in uploads directory. Upload a resume first.');
    return;
  }

  console.log(`📁 Found ${files.length} PDF file(s) to test:`);
  files.forEach((file, index) => {
    console.log(`${index + 1}. ${file}`);
  });

  // Test the most recent file
  const latestFile = files[files.length - 1];
  const filePath = `${uploadsDir}/${latestFile}`;
  
  console.log(`\n🔍 Testing extraction from: ${latestFile}`);
  console.log('=' .repeat(50));

  try {
    const result = await safeExtractResumeData(filePath);
    
    console.log('\n📊 EXTRACTION RESULTS:');
    console.log('=' .repeat(30));
    console.log(`👤 Name: "${result.name}"`);
    console.log(`📧 Email: "${result.email}"`);
    console.log(`📞 Phone: "${result.phone}"`);
    console.log(`📄 Summary: "${result.summary}"`);
    console.log(`🛠️ Skills: [${result.skills.join(', ')}]`);
    console.log(`❌ Parse Error: ${result.parseError}`);
    console.log(`📁 From Filename: ${result.extractedFromFilename || false}`);
    console.log(`📄 From PDF: ${result.extractedFromPDF || false}`);
    console.log(`📝 Raw Text Length: ${result.rawText.length} characters`);
    
    if (result.rawText.length > 0) {
      console.log(`\n📖 Raw Text Preview (first 300 chars):`);
      console.log(`"${result.rawText.substring(0, 300)}..."`);
    }

    console.log('\n🎯 ANALYSIS:');
    console.log('=' .repeat(20));
    
    if (result.extractedFromPDF) {
      console.log('✅ Successfully extracted from PDF content');
    } else if (result.extractedFromFilename) {
      console.log('⚠️ Fell back to filename extraction');
    }
    
    if (result.name !== 'Unknown Candidate') {
      console.log('✅ Name extraction successful');
    } else {
      console.log('❌ Name extraction failed');
    }
    
    if (result.email && !result.email.includes('candidate') && !result.email.includes('@example.com')) {
      console.log('✅ Real email found');
    } else {
      console.log('⚠️ Using placeholder email');
    }
    
    if (result.phone !== 'Not provided') {
      console.log('✅ Phone number found');
    } else {
      console.log('⚠️ No phone number found');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n🏁 Test completed!');
}

testRealPDFParsing().catch(console.error);
