/**
 * Safe PDF Parser - Alternative to pdf-parse
 * This version doesn't have the test file dependency issue
 */

import fs from 'fs';

/**
 * Safe PDF text extraction
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<string>} - Extracted text
 */
export const extractTextFromPDF = async (filePath) => {
  console.log(`[Safe PDF Parser] Attempting to extract text from: ${filePath}`);
  
  try {
    // Check if file exists and is readable
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const stats = fs.statSync(filePath);
    console.log(`[Safe PDF Parser] File size: ${stats.size} bytes`);
    
    // Try multiple PDF parsing approaches
    let pdfText = '';
    
    // Method 1: Try pdf-parse
    try {
      const pdfParse = await import('pdf-parse');
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse.default(dataBuffer, {
        // Options to improve parsing
        normalizeWhitespace: false,
        disableCombineTextItems: false
      });
      
      pdfText = data.text;
      console.log(`[Safe PDF Parser] ✅ PDF-parse successful, extracted ${pdfText.length} characters`);
      
    } catch (pdfError) {
      console.log(`[Safe PDF Parser] ⚠️ PDF-parse failed: ${pdfError.message}`);
      
      // Method 2: Try alternative parsing with different options
      try {
        const pdfParse = await import('pdf-parse');
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse.default(dataBuffer, {
          // More aggressive parsing options
          max: 0, // Parse all pages
          version: 'v1.10.100'
        });
        
        pdfText = data.text;
        console.log(`[Safe PDF Parser] ✅ Alternative PDF parsing successful, extracted ${pdfText.length} characters`);
        
      } catch (altError) {
        console.log(`[Safe PDF Parser] ⚠️ Alternative parsing also failed: ${altError.message}`);
        throw new Error('All PDF parsing methods failed');
      }
    }
    
    // Validate extracted text
    if (!pdfText || pdfText.trim().length < 10) {
      throw new Error('Extracted text is too short or empty');
    }
    
    console.log(`[Safe PDF Parser] 📄 Extracted text preview (first 500 chars):`);
    console.log(`"${pdfText.substring(0, 500)}"`);
    
    return pdfText;
    
  } catch (error) {
    console.log(`[Safe PDF Parser] ❌ PDF extraction completely failed: ${error.message}`);
    console.log('[Safe PDF Parser] 🔄 This means the PDF might be image-based or corrupted');
    
    // Return empty string to indicate parsing failure
    // The calling function will handle this appropriately
    return '';
  }
};

/**
 * Extract resume data safely
 * @param {string} filePath - Path to resume file
 * @returns {Promise<object>} - Extracted resume data
 */
export const safeExtractResumeData = async (filePath) => {
  console.log(`[Safe PDF Parser] Processing: ${filePath}`);
  
  try {
    // Extract text from PDF
    const text = await extractTextFromPDF(filePath);
    
    if (!text || text.trim().length === 0) {
      console.log('[Safe PDF Parser] ⚠️ No text extracted from PDF - might be image-based or corrupted');
      throw new Error('No text content found in PDF');
    }
    
    console.log(`[Safe PDF Parser] ✅ Successfully extracted ${text.length} characters from PDF`);
    console.log(`[Safe PDF Parser] 📄 Text preview: "${text.substring(0, 200)}..."`);
    
    // Extract information using regex patterns from REAL PDF text
    const name = extractName(text);
    const email = extractEmail(text);
    const phone = extractPhone(text);
    
    console.log(`[Safe PDF Parser] 🎯 REAL EXTRACTION RESULTS:`);
    console.log(`[Safe PDF Parser] Name: "${name}"`);
    console.log(`[Safe PDF Parser] Email: "${email}"`);
    console.log(`[Safe PDF Parser] Phone: "${phone}"`);
    
    // Determine if extraction was successful
    const hasRealName = name !== 'Unknown Candidate';
    const hasRealEmail = email && !email.includes('candidate') && !email.includes('@example.com');
    const hasRealPhone = phone !== 'Not provided';
    
    const extractionSuccess = hasRealName || hasRealEmail || hasRealPhone;
    
    return {
      name,
      email,
      phone,
      summary: extractSummary(text),
      skills: extractSkills(text),
      experience: [],
      education: [],
      rawText: text,
      parseError: !extractionSuccess,
      extractedFromPDF: true
    };
    
  } catch (error) {
    console.error('[Safe PDF Parser] ❌ PDF parsing failed completely:', error.message);
    console.log('[Safe PDF Parser] 🔄 Falling back to filename extraction...');
    
    // Ultimate fallback - extract from filename
    const filename = filePath.split(/[/\\]/).pop().replace(/\.[^/.]+$/, "");
    let possibleName = filename
      .replace(/[-_]/g, ' ')
      .replace(/resume|cv|curriculum|vitae/gi, '')
      .replace(/\d+/g, '') // Remove timestamp numbers
      .trim();
    
    if (possibleName.length > 2 && possibleName.length < 50) {
      possibleName = possibleName.split(' ')
        .filter(word => word.length > 0)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    } else {
      possibleName = 'Unknown Candidate';
    }
    
    console.log(`[Safe PDF Parser] 📁 Filename extraction result: "${possibleName}"`);
    
    return {
      name: possibleName,
      email: `candidate${Date.now()}@example.com`,
      phone: 'Not provided',
      summary: 'PDF parsing failed. Please verify your information manually.',
      skills: [],
      experience: [],
      education: [],
      rawText: '',
      parseError: true,
      extractedFromFilename: true
    };
  }
};

// Helper functions
function extractName(text) {
  const cleanText = text.replace(/\s+/g, ' ').trim();
  console.log('[Safe PDF Parser] 🔍 Searching for name in extracted text...');
  console.log('[Safe PDF Parser] Text preview:', cleanText.substring(0, 300));
  
  const namePatterns = [
    // Pattern 1: Very first line (most common in resumes)
    /^([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,2})(?:\s|$)/m,
    
    // Pattern 2: After common headers
    /(?:Name|Full Name|Candidate):?\s*([A-Z][a-zA-Z]+\s+[A-Z][a-zA-Z]+)/i,
    
    // Pattern 3: All caps name (common format)
    /^([A-Z]{2,}\s+[A-Z]{2,})(?:\s|$)/m,
    
    // Pattern 4: Before contact info
    /([A-Z][a-zA-Z]+\s+[A-Z][a-zA-Z]+)\s*(?:\n|\r\n).*?(?:Email|Phone|Contact)/i,
    
    // Pattern 5: Line before email
    /([A-Z][a-zA-Z]+\s+[A-Z][a-zA-Z]+)\s*(?:\n|\r\n).*?[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i,
    
    // Pattern 6: Mixed case at document start
    /^([A-Z][a-z]+\s+[A-Z][a-z]+)(?:\s|$)/m,
    
    // Pattern 7: After whitespace at start
    /^\s*([A-Z][a-zA-Z]+\s+[A-Z][a-zA-Z]+)/m
  ];
  
  for (let i = 0; i < namePatterns.length; i++) {
    const pattern = namePatterns[i];
    const match = cleanText.match(pattern);
    
    if (match && match[1]) {
      let name = match[1].trim();
      
      // Clean up the name - remove any non-letter characters except spaces
      name = name.replace(/[^A-Za-z\s]/g, '').trim();
      
      // Split into words and validate
      const words = name.split(/\s+/).filter(word => word.length > 1);
      
      // Accept names with 2-3 words (First Last or First Middle Last)
      if (words.length >= 2 && words.length <= 3) {
        // Check if it's not a common resume word
        const commonWords = [
          'resume', 'curriculum', 'vitae', 'profile', 'summary', 'objective', 
          'experience', 'education', 'skills', 'software', 'developer', 'engineer', 
          'manager', 'contact', 'information', 'professional', 'personal', 'about',
          'technical', 'projects', 'work', 'employment', 'career', 'qualifications'
        ];
        
        const isCommonWord = words.some(word => commonWords.includes(word.toLowerCase()));
        
        if (!isCommonWord) {
          // Format name properly
          const formattedName = words
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
          
          console.log(`[Safe PDF Parser] ✅ Found name with pattern ${i + 1}: "${formattedName}"`);
          return formattedName;
        } else {
          console.log(`[Safe PDF Parser] ⚠️ Rejected "${name}" - contains common words`);
        }
      } else {
        console.log(`[Safe PDF Parser] ⚠️ Rejected "${name}" - wrong word count (${words.length})`);
      }
    }
  }
  
  console.log('[Safe PDF Parser] ❌ Could not extract name from text');
  return 'Unknown Candidate';
}

function extractEmail(text) {
  console.log('[Safe PDF Parser] Searching for email in text...');
  
  const emailPatterns = [
    // Pattern 1: Email after "Email:" label
    /(?:Email|E-mail|Mail):?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
    // Pattern 2: Standalone email addresses
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
  ];
  
  for (const pattern of emailPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const email = match[1] || match[0];
      if (email && 
          email.includes('@') && 
          email.includes('.') &&
          !email.includes('example.com') &&
          !email.includes('email.com') &&
          email.length > 5 &&
          email.length < 50) {
        
        console.log(`[Safe PDF Parser] ✅ Found email: ${email}`);
        return email.toLowerCase();
      }
    }
  }
  
  console.log('[Safe PDF Parser] ⚠️ No valid email found, using unique placeholder');
  return `candidate${Date.now()}@example.com`;
}

function extractPhone(text) {
  const phonePatterns = [
    /(?:phone|tel|mobile|cell):?\s*(\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/gi,
    /(\+[0-9]{1,3}[-.\s]?[0-9]{3,5}[-.\s]?[0-9]{3,5}[-.\s]?[0-9]{3,5})/g,
    /(\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/g,
  ];
  
  for (const pattern of phonePatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const phone = match[1] || match[0];
      if (phone) {
        const cleanPhone = phone.replace(/[^\d+]/g, '');
        if (cleanPhone.length >= 10 && cleanPhone.length <= 15) {
          return phone.trim();
        }
      }
    }
  }
  
  return 'Not provided';
}

function extractSummary(text) {
  const summaryPatterns = [
    /(?:Summary|Profile|About|Objective):?\s*([^]*?)(?=\n\s*\n|\n[A-Z]|$)/i,
  ];
  
  for (const pattern of summaryPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim().substring(0, 300);
    }
  }
  
  return 'No summary available';
}

function extractSkills(text) {
  const skillsSection = text.match(/(?:Skills|Technologies):?\s*([^]*?)(?=\n\s*\n|\n[A-Z]|$)/i);
  
  if (skillsSection) {
    const commonSkills = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'HTML', 'CSS',
      'MongoDB', 'SQL', 'Git', 'Docker', 'AWS', 'TypeScript'
    ];
    
    return commonSkills.filter(skill => 
      skillsSection[1].toLowerCase().includes(skill.toLowerCase())
    );
  }
  
  return [];
}
