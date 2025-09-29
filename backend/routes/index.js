import express from 'express';
import upload from '../middleware/upload.js';
import * as candidateController from '../controllers/candidateController.js';
import * as interviewController from '../controllers/interviewController.js';
import * as chatController from '../controllers/chatController.js';
import { uploadResume } from '../controllers/resumeController.js';
import * as resumeController from '../controllers/resumeController.js';
import { generateQuestions, evaluateResponse } from '../controllers/aiController.js';
import { saveInterviewResult, getCompletedInterviews, getInterviewStats } from '../controllers/interviewResultController.js';

const router = express.Router();

// Candidate routes
router.get('/candidates', candidateController.getAllCandidates);
router.get('/candidates/:id', candidateController.getCandidate);
router.post('/candidates', candidateController.createCandidate);
router.put('/candidates/:id', candidateController.updateCandidate);
router.delete('/candidates/:id', candidateController.deleteCandidate);

// Interview routes
router.get('/interviews', interviewController.getAllInterviews);
router.get('/interviews/:id', interviewController.getInterview);
router.post('/interviews', interviewController.createInterview);
router.put('/interviews/:id', interviewController.updateInterview);
router.delete('/interviews/:id', interviewController.deleteInterview);

// Chat routes
router.get('/chat/interview/:interviewId', chatController.getChatMessages);
router.post('/chat', chatController.createChatMessage);
router.delete('/chat/:id', chatController.deleteChatMessage);

// Resume routes
router.post('/resumes', upload.single('resume'), uploadResume);
router.get('/resumes/candidate/:candidateId', resumeController.getResumeByCandidate);
router.delete('/resumes/:id', resumeController.deleteResume);

// AI routes
router.post('/ai/generate-questions', generateQuestions);
router.post('/ai/evaluate-response', evaluateResponse);

// Interview Results routes
router.post('/interview-results', saveInterviewResult);
router.get('/interview-results', getCompletedInterviews);
router.get('/interview-stats', getInterviewStats);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'AI Interview API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;