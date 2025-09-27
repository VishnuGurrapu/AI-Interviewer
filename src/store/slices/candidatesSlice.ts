import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Candidate, ChatMessage } from './interviewSlice';

interface CandidateWithHistory extends Candidate {
  chatHistory: ChatMessage[];
  aiSummary?: string;
}

interface CandidatesState {
  candidates: CandidateWithHistory[];
  searchTerm: string;
  sortBy: 'name' | 'score' | 'date';
  sortOrder: 'asc' | 'desc';
}

const initialState: CandidatesState = {
  candidates: [],
  searchTerm: '',
  sortBy: 'date',
  sortOrder: 'desc',
};

const candidatesSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    addCandidate: (state, action: PayloadAction<{ candidate: Candidate; chatHistory: ChatMessage[]; aiSummary?: string }>) => {
      const { candidate, chatHistory, aiSummary } = action.payload;
      const existingIndex = state.candidates.findIndex(c => c.id === candidate.id);
      
      if (existingIndex >= 0) {
        state.candidates[existingIndex] = { ...candidate, chatHistory, aiSummary };
      } else {
        state.candidates.push({ ...candidate, chatHistory, aiSummary });
      }
    },
    updateCandidateScore: (state, action: PayloadAction<{ id: string; score: number }>) => {
      const candidate = state.candidates.find(c => c.id === action.payload.id);
      if (candidate) {
        candidate.score = action.payload.score;
        candidate.status = 'completed';
      }
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'name' | 'score' | 'date'>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    },
    clearCandidates: (state) => {
      state.candidates = [];
    },
  },
});

export const {
  addCandidate,
  updateCandidateScore,
  setSearchTerm,
  setSortBy,
  setSortOrder,
  clearCandidates,
} = candidatesSlice.actions;

export default candidatesSlice.reducer;