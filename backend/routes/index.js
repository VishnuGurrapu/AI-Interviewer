import express from 'express';
import * as candidateController from '../controllers/candidateController.js';
import * as interviewController from '../controllers/interviewController.js';
import * as chatController from '../controllers/chatController.js';
import * as resumeController from '../controllers/resumeController.js';

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
router.post('/resumes', resumeController.uploadResume);
router.get('/resumes/candidate/:candidateId', resumeController.getResumeByCandidate);
router.delete('/resumes/:id', resumeController.deleteResume);

export default router;