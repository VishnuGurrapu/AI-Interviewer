import fs from 'fs';

// Safely import pdf-parse only when needed
let pdf = null;
let pdfLoadAttempted = false;

const loadPdfParse = async () => {
  if (pdfLoadAttempted) return pdf !== null;
  pdfLoadAttempted = true;
  
  try {
    // Change working directory temporarily to avoid the test file issue
    const originalCwd = process.cwd();
    
    // Import pdf-parse
    const pdfModule = await import('pdf-parse');
    pdf = pdfModule.default;
    
    console.log('[Resume Parser] ✅ pdf-parse loaded successfully');
    return true;
  } catch (error) {
    console.log('[Resume Parser] ⚠️ pdf-parse not available:', error.message);
    pdf = null;
    return false;
  }
};

/**
 * @description Extracts data from a resume PDF file using pdf-parse library.
 * This function parses the PDF and extracts basic information using regex patterns.
 * For production use, consider using more sophisticated NLP libraries or AI services.
 * @param {string} filePath - The path to the resume file.
 * @returns {Promise<object>} - A promise that resolves to the extracted resume data.
 */
export const extractDataFromResume = async (filePath) => {
  console.log(`[Resume Parser] Parsing resume from: ${filePath}`);
  
  try {
    // Ensure pdf-parse is loaded
    if (!pdf) {
      const loaded = await loadPdfParse();
      if (!loaded) {
        console.log('[Resume Parser] ⚠️ PDF parsing not available, using filename extraction');
        return await extractFromFilename(filePath);
      }
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    // Read the PDF file
    console.log('[Resume Parser] Reading PDF file...');
    const dataBuffer = fs.readFileSync(filePath);
    console.log(`[Resume Parser] File size: ${dataBuffer.length} bytes`);
    
    const data = await pdf(dataBuffer);
    const text = data.text;
    
    console.log(`[Resume Parser] PDF text extracted, length: ${text.length} characters`);
    console.log(`[Resume Parser] First 300 chars: "${text.substring(0, 300)}"`);
    
    // If text is empty or too short, it might be a parsing issue
    if (!text || text.length < 10) {
      console.log('[Resume Parser] ⚠️ PDF text too short, using fallback');
      return await extractFromFilename(filePath);
    }
    
    // Extract information using regex patterns
    const extractedData = {
      name: extractName(text),
      email: extractEmail(text),
      phone: extractPhone(text),
      summary: extractSummary(text),
      skills: extractSkills(text),
      experience: extractExperience(text),
      education: extractEducation(text),
      rawText: text // Store raw text for future AI processing
    };
    
    console.log('[Resume Parser] ✅ Successfully extracted data:', {
      name: extractedData.name,
      email: extractedData.email,
      phone: extractedData.phone,
      skillsCount: extractedData.skills.length,
      textLength: text.length
    });
    
    // Add validation flag
    const hasValidData = extractedData.name !== 'Unknown Candidate' || 
                        extractedData.email !== 'candidate@example.com' || 
                        extractedData.phone !== 'Not provided';
    
    if (!hasValidData) {
      extractedData.parseError = true;
      extractedData.summary = 'Resume parsing partially failed. Please verify your information below.';
    }
    
    return extractedData;
    
  } catch (error) {
    console.error('[Resume Parser] Error parsing resume:', error);
    
    // Return fallback data if parsing fails
    return {
      name: 'Unknown Candidate',
      email: `candidate${Date.now()}@example.com`,
      phone: 'Not provided',
      summary: 'Resume parsing failed. Please verify manually.',
      skills: [],
      experience: [],
      education: [],
      rawText: '',
      parseError: true
    };
  }
};

// Helper functions for data extraction
function extractName(text) {
  // Clean the text first
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  // Look for name patterns - more flexible patterns
  const namePatterns = [
    // Name at the beginning of document (most common)
    /^([A-Z][a-zA-Z]+ [A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)/m,
    // Name with label
    /(?:Name|Full Name):?\s*([A-Z][a-zA-Z]+ [A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)/i,
    // All caps name (common in headers)
    /^([A-Z]{2,}\s+[A-Z]{2,}(?:\s+[A-Z]{2,})?)/m,
    // Name followed by contact info
    /([A-Z][a-zA-Z]+ [A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)\s*[\n\r].*?(?:@|phone|tel|\+|\d{3})/i,
    // Name in first few lines
    /^.*?([A-Z][a-zA-Z]{2,} [A-Z][a-zA-Z]{2,}(?:\s+[A-Z][a-zA-Z]+)?)/m
  ];
  
  for (const pattern of namePatterns) {
    const match = cleanText.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      // Validate name (should be 2-50 chars, contain letters and spaces)
      if (name.length >= 4 && name.length <= 50 && /^[A-Za-z\s]+$/.test(name)) {
        // Proper case formatting
        return name.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      }
    }
  }
  
  console.log('[Resume Parser] ⚠️ Could not extract name from text');
  return 'Unknown Candidate';
}

function extractEmail(text) {
  // Multiple email patterns to catch different formats
  const emailPatterns = [
    // Standard email pattern
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
    // Email with label
    /(?:email|e-mail|mail):?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
    // Email in contact section
    /contact.*?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi
  ];
  
  for (const pattern of emailPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const email = match[1] || match[0];
      // Validate email format and exclude common placeholder emails
      if (email && 
          email.includes('@') && 
          email.includes('.') &&
          !email.includes('example.com') &&
          !email.includes('domain.com') &&
          !email.includes('email.com')) {
        console.log('[Resume Parser] ✅ Found email:', email);
        return email.toLowerCase();
      }
    }
  }
  
  console.log('[Resume Parser] ⚠️ Could not extract email from text');
  return `candidate${Date.now()}@example.com`;
}

function extractPhone(text) {
  const phonePatterns = [
    // US/Canada format: (123) 456-7890, 123-456-7890, 123.456.7890
    /(?:phone|tel|mobile|cell):?\s*(\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/gi,
    // International format: +1 123 456 7890, +91 12345 67890
    /(\+[0-9]{1,3}[-.\s]?[0-9]{3,5}[-.\s]?[0-9]{3,5}[-.\s]?[0-9]{3,5})/g,
    // Simple format: 1234567890, 123-456-7890
    /(\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/g,
    // Indian format: +91-12345-67890
    /(\+91[-.\s]?[0-9]{5}[-.\s]?[0-9]{5})/g,
    // General international
    /(\+[0-9]{1,3}[-.\s]?[0-9]{4,14})/g
  ];
  
  for (const pattern of phonePatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const phone = match[1] || match[0];
      if (phone) {
        // Clean and validate phone number
        const cleanPhone = phone.replace(/[^\d+]/g, '');
        if (cleanPhone.length >= 10 && cleanPhone.length <= 15) {
          console.log('[Resume Parser] ✅ Found phone:', phone.trim());
          return phone.trim();
        }
      }
    }
  }
  
  console.log('[Resume Parser] ⚠️ Could not extract phone from text');
  return 'Not provided';
}

function extractSummary(text) {
  const summaryPatterns = [
    /(?:Summary|Profile|About|Objective):?\s*([^]*?)(?=\n\s*\n|\n[A-Z]|$)/i,
    /(?:Professional Summary|Career Summary):?\s*([^]*?)(?=\n\s*\n|\n[A-Z]|$)/i
  ];
  
  for (const pattern of summaryPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim().substring(0, 500); // Limit to 500 chars
    }
  }
  
  // Fallback: use first paragraph
  const firstParagraph = text.split('\n\n')[1];
  return firstParagraph ? firstParagraph.trim().substring(0, 300) : 'No summary available';
}

function extractSkills(text) {
  const skillsSection = text.match(/(?:Skills|Technologies|Technical Skills):?\s*([^]*?)(?=\n\s*\n|\n[A-Z]|$)/i);
  
  if (skillsSection) {
    const skillsText = skillsSection[1];
    // Extract common programming languages and technologies
    const commonSkills = [
      'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
      'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask',
      'MongoDB', 'MySQL', 'PostgreSQL', 'Redis', 'AWS', 'Azure', 'Docker',
      'Kubernetes', 'Git', 'HTML', 'CSS', 'TypeScript', 'SQL'
    ];
    
    const foundSkills = commonSkills.filter(skill => 
      skillsText.toLowerCase().includes(skill.toLowerCase())
    );
    
    return foundSkills.length > 0 ? foundSkills : ['General Programming'];
  }
  
  return ['General Programming'];
}

function extractExperience(text) {
  // Simple experience extraction - look for job titles and companies
  const experiencePattern = /(?:Experience|Work History|Employment):?\s*([^]*?)(?=\n\s*\n[A-Z]|Education|Skills|$)/i;
  const match = text.match(experiencePattern);
  
  if (match) {
    // This is a simplified extraction - in production, use more sophisticated parsing
    return [{
      title: 'Software Developer',
      company: 'Previous Company',
      duration: 'See resume for details'
    }];
  }
  
  return [];
}

function extractEducation(text) {
  const educationPattern = /(?:Education|Academic Background):?\s*([^]*?)(?=\n\s*\n[A-Z]|Experience|Skills|$)/i;
  const match = text.match(educationPattern);
  
  if (match) {
    return [{
      institution: 'Educational Institution',
      degree: 'Degree',
      year: 'See resume for details'
    }];
  }
  
  return [];
}

// Fallback extraction from filename or basic file info
async function extractFromFilename(filePath) {
  console.log('[Resume Parser] 🔄 Using filename extraction fallback...');
  
  const filename = filePath.split(/[/\\]/).pop().replace(/\.[^/.]+$/, "");
  
  // Try to extract name from filename
  let possibleName = filename
    .replace(/[-_]/g, ' ')
    .replace(/resume|cv|curriculum|vitae/gi, '')
    .trim();
  
  if (possibleName.length > 2 && possibleName.length < 50) {
    // Capitalize first letters
    possibleName = possibleName.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  } else {
    possibleName = 'Unknown Candidate';
  }
  
  console.log(`[Resume Parser] Extracted name from filename: "${possibleName}"`);
  
  return {
    name: possibleName,
    email: `candidate${Date.now()}@example.com`,
    phone: 'Not provided',
    summary: 'Please verify your information below.',
    skills: [],
    experience: [],
    education: [],
    rawText: '',
    parseError: true,
    extractedFromFilename: true
  };
}
