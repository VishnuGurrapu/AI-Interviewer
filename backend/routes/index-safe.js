/**
 * Safe version of routes that loads modules individually
 */

import express from 'express';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Routes are working!' });
});

// Load modules safely one by one
const loadModules = async () => {
  const modules = {};
  
  try {
    console.log('📦 Loading upload middleware...');
    modules.upload = (await import('../middleware/upload.js')).default;
    console.log('✅ Upload middleware loaded');
  } catch (error) {
    console.error('❌ Upload middleware failed:', error.message);
  }

  try {
    console.log('📦 Loading candidate controller...');
    modules.candidateController = await import('../controllers/candidateController.js');
    console.log('✅ Candidate controller loaded');
  } catch (error) {
    console.error('❌ Candidate controller failed:', error.message);
  }

  try {
    console.log('📦 Loading interview controller...');
    modules.interviewController = await import('../controllers/interviewController.js');
    console.log('✅ Interview controller loaded');
  } catch (error) {
    console.error('❌ Interview controller failed:', error.message);
  }

  try {
    console.log('📦 Loading chat controller...');
    modules.chatController = await import('../controllers/chatController.js');
    console.log('✅ Chat controller loaded');
  } catch (error) {
    console.error('❌ Chat controller failed:', error.message);
  }

  try {
    console.log('📦 Loading resume controller...');
    modules.resumeController = await import('../controllers/resumeController.js');
    console.log('✅ Resume controller loaded');
  } catch (error) {
    console.error('❌ Resume controller failed:', error.message);
  }

  try {
    console.log('📦 Loading AI controller...');
    modules.aiController = await import('../controllers/aiController.js');
    console.log('✅ AI controller loaded');
  } catch (error) {
    console.error('❌ AI controller failed:', error.message);
  }

  return modules;
};

// Setup routes with loaded modules
const setupRoutes = (modules) => {
  // Health check
  router.get('/health', (req, res) => {
    res.json({ 
      status: 'UP', 
      message: 'API routes are healthy',
      loadedModules: Object.keys(modules)
    });
  });

  // Candidate routes (if available)
  if (modules.candidateController) {
    router.get('/candidates', modules.candidateController.getAllCandidates);
    router.get('/candidates/:id', modules.candidateController.getCandidate);
    router.post('/candidates', modules.candidateController.createCandidate);
    router.put('/candidates/:id', modules.candidateController.updateCandidate);
    router.delete('/candidates/:id', modules.candidateController.deleteCandidate);
    console.log('✅ Candidate routes registered');
  }

  // Interview routes (if available)
  if (modules.interviewController) {
    router.get('/interviews', modules.interviewController.getAllInterviews);
    router.get('/interviews/:id', modules.interviewController.getInterview);
    router.post('/interviews', modules.interviewController.createInterview);
    router.put('/interviews/:id', modules.interviewController.updateInterview);
    router.delete('/interviews/:id', modules.interviewController.deleteInterview);
    console.log('✅ Interview routes registered');
  }

  // Chat routes (if available)
  if (modules.chatController) {
    router.get('/chat/interview/:interviewId', modules.chatController.getChatMessages);
    router.post('/chat', modules.chatController.createChatMessage);
    router.delete('/chat/:id', modules.chatController.deleteChatMessage);
    console.log('✅ Chat routes registered');
  }

  // Resume routes (if available)
  if (modules.resumeController && modules.upload) {
    router.post('/resumes', modules.upload.single('resume'), modules.resumeController.uploadResume);
    router.get('/resumes/candidate/:candidateId', modules.resumeController.getResumeByCandidate);
    router.delete('/resumes/:id', modules.resumeController.deleteResume);
    console.log('✅ Resume routes registered');
  }

  // AI routes (if available)
  if (modules.aiController) {
    router.post('/ai/generate-questions', modules.aiController.generateQuestions);
    router.post('/ai/evaluate-response', modules.aiController.evaluateResponse);
    router.post('/ai/generate-summary', modules.aiController.generateSummary);
    router.post('/ai/initialize', modules.aiController.initializeAI);
    console.log('✅ AI routes registered');
  }
};

// Initialize routes
const initializeRoutes = async () => {
  try {
    const modules = await loadModules();
    setupRoutes(modules);
    console.log('🎉 Routes initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize routes:', error.message);
  }
};

// Load routes
initializeRoutes();

export default router;
