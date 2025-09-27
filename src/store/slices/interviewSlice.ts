import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeFile?: File;
  resumeUrl?: string;
  score?: number;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
}

export interface Question {
  id: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // in seconds
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: string;
  questionId?: string;
}

interface InterviewState {
  currentCandidate: Candidate | null;
  questions: Question[];
  currentQuestionIndex: number;
  chatHistory: ChatMessage[];
  timeRemaining: number;
  isInterviewActive: boolean;
  isCollectingInfo: boolean;
  finalScore: number | null;
  aiSummary: string | null;
  showWelcomeBack: boolean;
}

const defaultQuestions: Question[] = [
  { id: '1', text: 'Tell me about yourself and your background.', difficulty: 'easy', timeLimit: 120 },
  { id: '2', text: 'What are your greatest strengths as a professional?', difficulty: 'easy', timeLimit: 120 },
  { id: '3', text: 'Describe a challenging project you worked on and how you overcame obstacles.', difficulty: 'medium', timeLimit: 180 },
  { id: '4', text: 'How do you handle working under pressure and tight deadlines?', difficulty: 'medium', timeLimit: 180 },
  { id: '5', text: 'Explain a time when you had to learn a new technology quickly for a project.', difficulty: 'hard', timeLimit: 240 },
  { id: '6', text: 'Where do you see yourself in 5 years and how does this role fit into your career goals?', difficulty: 'hard', timeLimit: 240 },
];

const initialState: InterviewState = {
  currentCandidate: null,
  questions: defaultQuestions,
  currentQuestionIndex: 0,
  chatHistory: [],
  timeRemaining: 0,
  isInterviewActive: false,
  isCollectingInfo: false,
  finalScore: null,
  aiSummary: null,
  showWelcomeBack: false,
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setCurrentCandidate: (state, action: PayloadAction<Candidate>) => {
      state.currentCandidate = action.payload;
    },
    addChatMessage: (state, action: PayloadAction<Omit<ChatMessage, 'id' | 'timestamp'>>) => {
      const message: ChatMessage = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      };
      state.chatHistory.push(message);
    },
    startInfoCollection: (state) => {
      state.isCollectingInfo = true;
      state.chatHistory = [{
        id: Date.now().toString(),
        text: 'Welcome! I\'ll help you with your interview today. Let me gather some basic information first.',
        sender: 'bot',
        timestamp: new Date().toISOString(),
      }];
    },
    startInterview: (state) => {
      state.isInterviewActive = true;
      state.isCollectingInfo = false;
      state.currentQuestionIndex = 0;
      state.timeRemaining = state.questions[0].timeLimit;
    },
    nextQuestion: (state) => {
      if (state.currentQuestionIndex < state.questions.length - 1) {
        state.currentQuestionIndex += 1;
        state.timeRemaining = state.questions[state.currentQuestionIndex].timeLimit;
      } else {
        state.isInterviewActive = false;
        state.finalScore = Math.floor(Math.random() * 40) + 60; // Demo score
        state.aiSummary = 'Great interview! You demonstrated strong communication skills and technical knowledge.';
      }
    },
    updateTimeRemaining: (state, action: PayloadAction<number>) => {
      state.timeRemaining = action.payload;
      if (state.timeRemaining <= 0 && state.isInterviewActive) {
        // Auto-submit when time runs out
        interviewSlice.caseReducers.nextQuestion(state);
      }
    },
    resetInterview: (state) => {
      state.currentCandidate = null;
      state.currentQuestionIndex = 0;
      state.chatHistory = [];
      state.timeRemaining = 0;
      state.isInterviewActive = false;
      state.isCollectingInfo = false;
      state.finalScore = null;
      state.aiSummary = null;
      state.showWelcomeBack = false;
    },
    setWelcomeBack: (state, action: PayloadAction<boolean>) => {
      state.showWelcomeBack = action.payload;
    },
  },
});

export const {
  setCurrentCandidate,
  addChatMessage,
  startInfoCollection,
  startInterview,
  nextQuestion,
  updateTimeRemaining,
  resetInterview,
  setWelcomeBack,
} = interviewSlice.actions;

export default interviewSlice.reducer;