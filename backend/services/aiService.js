/**
 * AI Service for handling LLM integrations
 * This service will be used for:
 * - Generating interview questions based on resume
 * - Evaluating candidate responses
 * - Providing AI-powered feedback and scoring
 */

let openaiClient = null;
let isOpenAIAvailable = false;

/**
 * Initialize AI service with API key
 * @param {string} apiKey - OpenAI API key
 */
export const initializeAI = async (apiKey) => {
  if (!apiKey) {
    console.log('[AI Service] No API key provided, using mock responses');
    return false;
  }

  try {
    // Dynamic import for OpenAI
    const { default: OpenAI } = await import('openai');
    
    openaiClient = new OpenAI({ 
      apiKey: apiKey 
    });
    
    isOpenAIAvailable = true;
    console.log('[AI Service] ✅ OpenAI client initialized successfully');
    return true;
  } catch (error) {
    console.log('[AI Service] ⚠️ OpenAI not available:', error.message);
    console.log('[AI Service] Using mock responses');
    isOpenAIAvailable = false;
    openaiClient = null;
    return false;
  }
};

// Safe initialization function - delay to ensure dotenv is loaded
const safeInitialize = () => {
  // Delay initialization to ensure dotenv has loaded
  setTimeout(() => {
    try {
      const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_APL_KEY || process.env.OPEN_API_KEY;
      console.log('[AI Service] Checking for API key... Found:', apiKey ? 'Yes (****)' : 'No');
      
      if (apiKey) {
        console.log('[AI Service] Initializing OpenAI client...');
        initializeAI(apiKey).then(() => {
          console.log('[AI Service] ✅ OpenAI client initialized successfully');
        }).catch(error => {
          console.log('[AI Service] ⚠️ OpenAI initialization error:', error.message);
          console.log('[AI Service] Using mock responses');
        });
      } else {
        console.log('[AI Service] No OpenAI API key found in environment variables');
        console.log('[AI Service] Set OPENAI_API_KEY, OPEN_APL_KEY, or OPEN_API_KEY in .env file');
        
        // Debug: show relevant env vars
        const relevantVars = Object.keys(process.env).filter(k => 
          k.includes('API') || k.includes('APL') || k.includes('OPENAI')
        );
        console.log('[AI Service] Relevant env vars found:', relevantVars);
      }
    } catch (error) {
      console.log('[AI Service] Initialization error, using mock responses:', error.message);
    }
  }, 1000); // 1 second delay
};

// Initialize safely after a delay
safeInitialize();

/**
 * Generate interview questions based on resume data
 * @param {object} resumeData - Extracted resume data
 * @param {string} jobRole - Target job role
 * @returns {Promise<Array>} - Array of generated questions
 */
export const generateInterviewQuestions = async (resumeData, jobRole = 'Software Developer') => {
  console.log('[AI Service] Generating interview questions...');
  
  if (openaiClient && isOpenAIAvailable) {
    try {
      const skills = resumeData.skills?.join(', ') || 'general programming';
      const experience = resumeData.experience?.map(exp => `${exp.title} at ${exp.company}`).join(', ') || 'various roles';
      
      const prompt = `Generate 6 interview questions for a ${jobRole} position. 
      
Candidate background:
- Skills: ${skills}
- Experience: ${experience}
- Summary: ${resumeData.summary || 'No summary provided'}

Please generate questions that are:
1. Relevant to their background and the ${jobRole} role
2. Mix of easy (2), medium (2), and hard (2) difficulty levels
3. Include behavioral and technical questions
4. Personalized based on their skills and experience

Format the response as a JSON array with this structure:
[
  {
    "id": "1",
    "text": "Question text here",
    "difficulty": "easy|medium|hard",
    "timeLimit": 120
  }
]

Time limits: easy=120s, medium=180s, hard=240s`;

      const response = await openaiClient.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1000
      });

      const aiResponse = response.choices[0].message.content;
      console.log('[AI Service] ✅ Generated questions using OpenAI');
      
      // Parse the AI response
      try {
        const questions = JSON.parse(aiResponse);
        return Array.isArray(questions) ? questions : parseQuestionsFromText(aiResponse);
      } catch (parseError) {
        console.log('[AI Service] ⚠️ Failed to parse JSON, using text parsing');
        return parseQuestionsFromText(aiResponse);
      }
      
    } catch (error) {
      console.error('[AI Service] ❌ OpenAI API error:', error.message);
      console.log('[AI Service] Falling back to mock questions');
    }
  }
  
  // Fallback: Enhanced mock questions based on resume skills
  const skills = resumeData.skills || [];
  const mockQuestions = [
    {
      id: '1',
      text: 'Tell me about yourself and your background.',
      difficulty: 'easy',
      timeLimit: 120
    },
    {
      id: '2',
      text: skills.length > 0 
        ? `I see you have experience with ${skills[0]}. Can you describe a project where you used this technology?`
        : 'Can you describe a challenging project you worked on recently?',
      difficulty: 'medium',
      timeLimit: 180
    },
    {
      id: '3',
      text: 'What are your greatest strengths as a professional?',
      difficulty: 'easy',
      timeLimit: 120
    },
    {
      id: '4',
      text: 'Describe a challenging problem you solved and your approach.',
      difficulty: 'medium',
      timeLimit: 180
    },
    {
      id: '5',
      text: skills.length > 1 
        ? `How would you handle learning ${skills[1]} if required for this role?`
        : 'How do you approach learning new technologies quickly?',
      difficulty: 'hard',
      timeLimit: 240
    },
    {
      id: '6',
      text: 'Where do you see yourself in 5 years and how does this role fit your goals?',
      difficulty: 'hard',
      timeLimit: 240
    }
  ];
  
  return mockQuestions;
};

/**
 * Evaluate candidate response using AI
 * @param {string} question - The interview question
 * @param {string} response - Candidate's response
 * @param {object} resumeData - Candidate's resume data for context
 * @returns {Promise<object>} - Evaluation result with score and feedback
 */
export const evaluateResponse = async (question, response, resumeData) => {
  console.log('[AI Service] Evaluating response...');
  
  if (openaiClient && isOpenAIAvailable) {
    try {
      const prompt = `Evaluate this interview response on a scale of 1-10.

Question: "${question}"

Candidate's Response: "${response}"

Candidate Background:
- Skills: ${resumeData.skills?.join(', ') || 'Not specified'}
- Summary: ${resumeData.summary || 'Not provided'}

Please evaluate based on:
1. Relevance to the question (25%)
2. Clarity and communication (25%)
3. Technical accuracy (25%)
4. Depth and examples (25%)

Provide your evaluation in this JSON format:
{
  "score": 8,
  "feedback": "Detailed feedback about the response...",
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Improvement 1", "Improvement 2"]
}

Be constructive and specific in your feedback.`;

      const evaluation = await openaiClient.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      });

      const aiResponse = evaluation.choices[0].message.content;
      console.log('[AI Service] ✅ Evaluated response using OpenAI');

      try {
        const result = JSON.parse(aiResponse);
        return {
          score: Math.min(Math.max(result.score || 5, 1), 10),
          feedback: result.feedback || 'Good response overall.',
          strengths: Array.isArray(result.strengths) ? result.strengths : ['Clear communication'],
          improvements: Array.isArray(result.improvements) ? result.improvements : []
        };
      } catch (parseError) {
        console.log('[AI Service] ⚠️ Failed to parse evaluation JSON');
        return parseEvaluationFromText(aiResponse, response);
      }

    } catch (error) {
      console.error('[AI Service] ❌ OpenAI evaluation error:', error.message);
      console.log('[AI Service] Falling back to mock evaluation');
    }
  }
  
  // Mock evaluation based on response length and keywords
  const responseLength = response.length;
  const hasKeywords = resumeData.skills?.some(skill => 
    response.toLowerCase().includes(skill.toLowerCase())
  );
  
  let score = 5; // Base score
  
  if (responseLength > 100) score += 2;
  if (responseLength > 300) score += 1;
  if (hasKeywords) score += 2;
  
  score = Math.min(score, 10);
  
  return {
    score,
    feedback: generateMockFeedback(score, responseLength, hasKeywords),
    strengths: ['Clear communication', 'Relevant experience'],
    improvements: score < 7 ? ['Provide more specific examples', 'Elaborate on technical details'] : []
  };
};

/**
 * Generate overall interview summary and final score
 * @param {Array} evaluations - Array of individual question evaluations
 * @param {object} candidateData - Candidate information
 * @returns {Promise<object>} - Final summary and score
 */
export const generateInterviewSummary = async (evaluations, candidateData) => {
  console.log('[AI Service] Generating interview summary...');
  
  if (openaiClient && isOpenAIAvailable) {
    try {
      const averageScore = evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0) / evaluations.length;
      const allFeedback = evaluations.map(evaluation => evaluation.feedback).join('\n');
      const allStrengths = evaluations.flatMap(evaluation => evaluation.strengths || []);
      const allImprovements = evaluations.flatMap(evaluation => evaluation.improvements || []);

      const prompt = `Generate a comprehensive interview summary for ${candidateData.name || 'the candidate'}.

Interview Performance:
- Average Score: ${averageScore.toFixed(1)}/10
- Individual Feedback: ${allFeedback}
- Strengths Identified: ${allStrengths.join(', ')}
- Areas for Improvement: ${allImprovements.join(', ')}

Candidate Background:
- Email: ${candidateData.email}
- Phone: ${candidateData.phone}

Please provide a comprehensive summary in this JSON format:
{
  "finalScore": 75,
  "summary": "Detailed summary of the candidate's performance...",
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}

The summary should be professional, balanced, and actionable. Final score should be 0-100.`;

      const summaryResponse = await openaiClient.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        max_tokens: 600
      });

      const aiResponse = summaryResponse.choices[0].message.content;
      console.log('[AI Service] ✅ Generated summary using OpenAI');

      try {
        const result = JSON.parse(aiResponse);
        return {
          finalScore: Math.min(Math.max(result.finalScore || Math.round(averageScore * 10), 0), 100),
          summary: result.summary || generateMockSummary(Math.round(averageScore * 10), candidateData),
          recommendations: Array.isArray(result.recommendations) ? result.recommendations : 
            (result.finalScore >= 70 ? ['Strong candidate', 'Proceed to next round'] : ['Needs improvement', 'Consider additional screening'])
        };
      } catch (parseError) {
        console.log('[AI Service] ⚠️ Failed to parse summary JSON');
        return parseSummaryFromText(aiResponse, averageScore, candidateData);
      }

    } catch (error) {
      console.error('[AI Service] ❌ OpenAI summary error:', error.message);
      console.log('[AI Service] Falling back to mock summary');
    }
  }
  
  // Mock summary generation
  const averageScore = evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0) / evaluations.length;
  const finalScore = Math.round(averageScore * 10); // Convert to percentage
  
  const summary = generateMockSummary(finalScore, candidateData);
  
  return {
    finalScore,
    summary,
    recommendations: finalScore >= 70 ? 
      ['Strong candidate', 'Proceed to next round'] : 
      ['Needs improvement', 'Consider additional screening']
  };
};

// Helper functions
function generateMockFeedback(score, responseLength, hasKeywords) {
  if (score >= 8) {
    return 'Excellent response! You provided detailed examples and demonstrated strong knowledge.';
  } else if (score >= 6) {
    return 'Good response. Consider providing more specific examples to strengthen your answer.';
  } else {
    return 'Your response could be improved. Try to provide more detailed examples and relate them to your experience.';
  }
}

function generateMockSummary(finalScore, candidateData) {
  const name = candidateData.name || 'The candidate';
  
  if (finalScore >= 80) {
    return `${name} performed exceptionally well in the interview. They demonstrated strong technical knowledge, excellent communication skills, and provided detailed examples from their experience. Highly recommended for the next round.`;
  } else if (finalScore >= 60) {
    return `${name} showed good potential during the interview. They have relevant experience and decent communication skills, though some responses could have been more detailed. Consider for further evaluation.`;
  } else {
    return `${name} participated in the interview but showed areas for improvement. Consider additional screening or training opportunities to help develop their skills further.`;
  }
}

// Helper functions for parsing AI responses
function parseQuestionsFromText(text) {
  // Fallback parser for when JSON parsing fails
  const lines = text.split('\n').filter(line => line.trim());
  const questions = [];
  let currentId = 1;
  
  for (const line of lines) {
    if (line.includes('?') && line.length > 20) {
      const difficulty = line.toLowerCase().includes('easy') ? 'easy' : 
                       line.toLowerCase().includes('hard') ? 'hard' : 'medium';
      const timeLimit = difficulty === 'easy' ? 120 : difficulty === 'medium' ? 180 : 240;
      
      questions.push({
        id: currentId.toString(),
        text: line.replace(/^\d+\.?\s*/, '').trim(),
        difficulty,
        timeLimit
      });
      currentId++;
      
      if (questions.length >= 6) break;
    }
  }
  
  return questions.length > 0 ? questions : getDefaultQuestions();
}

function parseEvaluationFromText(text, response) {
  // Extract score from text
  const scoreMatch = text.match(/score[:\s]*(\d+)/i);
  const score = scoreMatch ? Math.min(Math.max(parseInt(scoreMatch[1]), 1), 10) : 6;
  
  return {
    score,
    feedback: text.substring(0, 200) + '...',
    strengths: ['Communication skills', 'Technical knowledge'],
    improvements: score < 7 ? ['Provide more examples', 'Be more specific'] : []
  };
}

function parseSummaryFromText(text, averageScore, candidateData) {
  const finalScore = Math.round(averageScore * 10);
  
  return {
    finalScore,
    summary: text.substring(0, 300) + '...',
    recommendations: finalScore >= 70 ? 
      ['Strong candidate', 'Proceed to next round'] : 
      ['Needs improvement', 'Consider additional screening']
  };
}

function getDefaultQuestions() {
  return [
    {
      id: '1',
      text: 'Tell me about yourself and your background.',
      difficulty: 'easy',
      timeLimit: 120
    },
    {
      id: '2',
      text: 'What are your greatest strengths as a professional?',
      difficulty: 'easy',
      timeLimit: 120
    },
    {
      id: '3',
      text: 'Describe a challenging project you worked on.',
      difficulty: 'medium',
      timeLimit: 180
    },
    {
      id: '4',
      text: 'How do you handle working under pressure?',
      difficulty: 'medium',
      timeLimit: 180
    },
    {
      id: '5',
      text: 'Where do you see yourself in 5 years?',
      difficulty: 'hard',
      timeLimit: 240
    },
    {
      id: '6',
      text: 'Why should we hire you for this position?',
      difficulty: 'hard',
      timeLimit: 240
    }
  ];
}

export default {
  initializeAI,
  generateInterviewQuestions,
  evaluateResponse,
  generateInterviewSummary
};
