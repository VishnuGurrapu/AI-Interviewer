import aiService from '../services/aiService.js';
import Resume from '../models/Resume.js';
import Candidate from '../models/Candidate.js';

/**
 * Generate interview questions based on candidate's resume
 */
export const generateQuestions = async (req, res) => {
  try {
    const { candidateId, jobRole = 'Software Developer' } = req.body;
    
    // Get candidate's resume data
    const resume = await Resume.findOne({ candidate: candidateId });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found for candidate' });
    }
    
    // Generate questions using AI service
    const questions = await aiService.generateInterviewQuestions(
      resume.extractedData,
      jobRole
    );
    
    res.status(200).json({ questions });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Evaluate a candidate's response to a question
 */
export const evaluateResponse = async (req, res) => {
  try {
    const { candidateId, question, response } = req.body;
    
    if (!question || !response) {
      return res.status(400).json({ message: 'Question and response are required' });
    }
    
    // Get candidate's resume data for context
    const resume = await Resume.findOne({ candidate: candidateId });
    const resumeData = resume ? resume.extractedData : {};
    
    // Evaluate response using AI service
    const evaluation = await aiService.evaluateResponse(question, response, resumeData);
    
    res.status(200).json({ evaluation });
  } catch (error) {
    console.error('Error evaluating response:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Generate final interview summary and score
 */
export const generateSummary = async (req, res) => {
  try {
    const { candidateId, evaluations } = req.body;
    
    if (!evaluations || !Array.isArray(evaluations)) {
      return res.status(400).json({ message: 'Evaluations array is required' });
    }
    
    // Get candidate data
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    
    // Generate summary using AI service
    const summary = await aiService.generateInterviewSummary(evaluations, candidate);
    
    // Update candidate with final score and summary
    candidate.score = summary.finalScore;
    candidate.aiSummary = summary.summary;
    candidate.status = 'completed';
    await candidate.save();
    
    res.status(200).json({ 
      summary: summary.summary,
      finalScore: summary.finalScore,
      recommendations: summary.recommendations
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Initialize AI service with API key
 */
export const initializeAI = async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    aiService.initializeAI(apiKey);
    
    res.status(200).json({ message: 'AI service initialized successfully' });
  } catch (error) {
    console.error('Error initializing AI:', error);
    res.status(500).json({ message: error.message });
  }
};
