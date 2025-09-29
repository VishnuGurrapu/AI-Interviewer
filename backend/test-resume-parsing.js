/**
 * Test resume parsing with a sample text
 */

import { extractDataFromResume } from './utils/resumeParser.js';
import fs from 'fs';

async function testResumeParsing() {
  console.log('🧪 Testing Resume Parsing...\n');

  // Create a sample text file to test parsing
  const sampleResumeText = `
JOHN DOE
Software Developer
Email: john.doe@email.com
Phone: +1-555-123-4567

SUMMARY
Experienced software developer with 5 years in web development.

SKILLS
JavaScript, React, Node.js, Python, MongoDB

EXPERIENCE
Senior Developer at Tech Corp (2020-2023)
- Developed web applications
- Led team of 3 developers

EDUCATION
Computer Science, University of Technology (2019)
`;

  // Create a temporary text file
  const testFilePath = './test-resume.txt';
  fs.writeFileSync(testFilePath, sampleResumeText);

  try {
    console.log('1. Testing with sample resume text...');
    
    // Test the extraction (this will fail for PDF but show us the logic)
    const result = await extractDataFromResume(testFilePath);
    
    console.log('✅ Extraction Result:');
    console.log('   Name:', result.name);
    console.log('   Email:', result.email);
    console.log('   Phone:', result.phone);
    console.log('   Parse Error:', result.parseError);
    console.log('   From Filename:', result.extractedFromFilename);

    // Clean up
    fs.unlinkSync(testFilePath);

    console.log('\n2. Testing filename extraction...');
    const filenameResult = await extractDataFromResume('./john-doe-resume.pdf');
    console.log('✅ Filename Result:');
    console.log('   Name:', filenameResult.name);
    console.log('   Email:', filenameResult.email);
    console.log('   Phone:', filenameResult.phone);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Clean up on error
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  }

  console.log('\n🎯 If you see "Unknown Candidate" above, the parsing logic needs more work.');
  console.log('If you see "John Doe" from filename test, the filename extraction is working.');
}

testResumeParsing();
