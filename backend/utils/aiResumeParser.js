import fs from 'fs';

let openaiClient = null;
let isOpenAIAvailable = false;
let pdfParse = null;

// Lazy load pdf-parse to avoid initialization issues
const getPdfParse = async () => {
  if (!pdfParse) {
    const pdfModule = await import('pdf-parse');
    pdfParse = pdfModule.default;
  }
  return pdfParse;
};

// Initialize OpenAI client
const initializeOpenAI = async () => {
  if (openaiClient) return true;
  
  try {
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_APL_KEY || process.env.OPEN_API_KEY;
    
    if (!apiKey) {
      console.log('[AI Resume Parser] No OpenAI API key found');
      return false;
    }
    
    const { default: OpenAI } = await import('openai');
    openaiClient = new OpenAI({ apiKey });
    isOpenAIAvailable = true;
    console.log('[AI Resume Parser] ✅ OpenAI initialized');
    return true;
  } catch (error) {
    console.log('[AI Resume Parser] ⚠️ OpenAI initialization failed:', error.message);
    return false;
  }
};

/**
 * Extract resume data using OpenAI for intelligent parsing
 * @param {string} filePath - Path to the resume PDF
 * @param {string} candidateName - Name provided by the candidate
 * @returns {Promise<object>} Extracted resume data
 */
export const extractResumeWithAI = async (filePath, candidateName) => {
  console.log('[AI Resume Parser] Starting AI-powered extraction...');
  
  try {
    // Read and parse PDF
    const dataBuffer = fs.readFileSync(filePath);
    const pdf = await getPdfParse();
    const pdfData = await pdf(dataBuffer);
    const resumeText = pdfData.text;
    
    console.log('[AI Resume Parser] PDF text extracted, length:', resumeText.length);
    
    // Initialize OpenAI if not already done
    await initializeOpenAI();
    
    // If OpenAI is available, use it for intelligent extraction
    if (openaiClient && isOpenAIAvailable) {
      return await extractWithOpenAI(resumeText, candidateName);
    }
    
    // Fallback to regex-based extraction
    return extractWithRegex(resumeText, candidateName);
    
  } catch (error) {
    console.error('[AI Resume Parser] ❌ Error:', error.message);
    return {
      name: candidateName || 'Unknown Candidate',
      email: null,
      phone: null,
      summary: 'Error parsing resume',
      skills: [],
      experience: [],
      education: [],
      parseError: true,
      extractedFromPDF: false
    };
  }
};

/**
 * Extract resume data using OpenAI API
 */
async function extractWithOpenAI(resumeText, candidateName) {
  try {
    const prompt = `Extract structured information from this resume. The candidate's name is "${candidateName}".

Resume Text:
${resumeText.substring(0, 4000)} 

Please extract and return a JSON object with this exact structure:
{
  "name": "${candidateName}",
  "email": "extracted email or null",
  "phone": "extracted phone number or null",
  "summary": "brief professional summary",
  "skills": ["skill1", "skill2", ...],
  "experience": [
    {
      "title": "job title",
      "company": "company name",
      "duration": "time period",
      "description": "brief description"
    }
  ],
  "education": [
    {
      "degree": "degree name",
      "institution": "school name",
      "year": "graduation year"
    }
  ]
}

Important:
- Use the provided name: "${candidateName}"
- Extract email and phone if present, otherwise use null
- Skills should be an array of technical/professional skills
- Be accurate and extract only what's clearly stated in the resume
- Return ONLY valid JSON, no additional text`;

    console.log('[AI Resume Parser] Calling OpenAI API...');
    
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a precise resume parser. Extract information accurately and return only valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 1500
    });

    const aiResponse = response.choices[0].message.content.trim();
    console.log('[AI Resume Parser] ✅ OpenAI response received');
    
    // Parse the JSON response
    try {
      // Remove markdown code blocks if present
      const jsonText = aiResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const extractedData = JSON.parse(jsonText);
      
      return {
        name: candidateName, // Always use the provided name
        email: extractedData.email || null,
        phone: extractedData.phone || null,
        summary: extractedData.summary || 'No summary available',
        skills: Array.isArray(extractedData.skills) ? extractedData.skills : [],
        experience: Array.isArray(extractedData.experience) ? extractedData.experience : [],
        education: Array.isArray(extractedData.education) ? extractedData.education : [],
        parseError: false,
        extractedFromPDF: true,
        aiEnhanced: true
      };
    } catch (parseError) {
      console.error('[AI Resume Parser] ⚠️ Failed to parse OpenAI JSON response');
      // Fallback to regex extraction
      return extractWithRegex(resumeText, candidateName);
    }
    
  } catch (error) {
    console.error('[AI Resume Parser] ❌ OpenAI extraction failed:', error.message);
    // Fallback to regex extraction
    return extractWithRegex(resumeText, candidateName);
  }
}

/**
 * Fallback: Extract resume data using regex patterns
 */
function extractWithRegex(text, candidateName) {
  console.log('[AI Resume Parser] Using regex-based extraction (fallback)');
  
  // Email pattern
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const emails = text.match(emailRegex);
  
  // Phone patterns (Indian and international)
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{10}/g;
  const phones = text.match(phoneRegex);
  
  // Extract skills (common programming languages and technologies)
  const skillKeywords = [
    'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'Angular', 'Vue',
    'SQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'Git', 'TypeScript',
    'HTML', 'CSS', 'Express', 'Django', 'Flask', 'Spring', 'REST API',
    'GraphQL', 'Redis', 'PostgreSQL', 'MySQL', 'CI/CD', 'Agile', 'Scrum'
  ];
  
  const skills = skillKeywords.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
  
  return {
    name: candidateName || 'Unknown Candidate',
    email: emails && emails.length > 0 ? emails[0] : null,
    phone: phones && phones.length > 0 ? phones[0].replace(/\D/g, '') : null,
    summary: 'Resume parsed successfully',
    skills: skills.length > 0 ? skills : [],
    experience: [],
    education: [],
    parseError: false,
    extractedFromPDF: true,
    aiEnhanced: false
  };
}

export default {
  extractResumeWithAI
};
