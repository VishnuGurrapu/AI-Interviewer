/**
 * API Service for communicating with the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface CandidateData {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  status: 'pending' | 'in-progress' | 'completed';
  score?: number;
  aiSummary?: string;
  createdAt?: string;
}

export interface ResumeData {
  _id?: string;
  candidate: string;
  fileUrl: string;
  extractedData: {
    name: string;
    email: string;
    phone: string;
    summary: string;
    skills: string[];
    experience: any[];
    education: any[];
    rawText: string;
    parseError?: boolean;
  };
}

export interface InterviewData {
  _id?: string;
  candidate: string;
  questions: string[];
  chatMessages: string[];
  score?: number;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt?: string;
  completedAt?: string;
}

export interface QuestionData {
  _id?: string;
  id?: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  answer?: string;
  interview?: string;
}

export interface ChatMessageData {
  _id?: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: string;
  interview?: string;
}

// API Helper function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('API request failed:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Resume API
export const resumeAPI = {
  /**
   * Upload resume file
   */
  upload: async (file: File, candidateId?: string): Promise<ApiResponse<{
    candidate: CandidateData;
    resume: ResumeData;
    extractedData: ResumeData['extractedData'];
  }>> => {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      if (candidateId) {
        formData.append('candidateId', candidateId);
      }

      const response = await fetch(`${API_BASE_URL}/resumes`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Resume upload failed:', error);
      return { error: error instanceof Error ? error.message : 'Upload failed' };
    }
  },

  /**
   * Get resume by candidate ID
   */
  getByCandidate: async (candidateId: string): Promise<ApiResponse<ResumeData>> => {
    return apiRequest(`/resumes/candidate/${candidateId}`);
  },

  /**
   * Delete resume
   */
  delete: async (resumeId: string): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest(`/resumes/${resumeId}`, { method: 'DELETE' });
  },
};

// Candidate API
export const candidateAPI = {
  /**
   * Get all candidates
   */
  getAll: async (): Promise<ApiResponse<CandidateData[]>> => {
    return apiRequest('/candidates');
  },

  /**
   * Get candidate by ID
   */
  getById: async (id: string): Promise<ApiResponse<CandidateData>> => {
    return apiRequest(`/candidates/${id}`);
  },

  /**
   * Create new candidate
   */
  create: async (candidateData: Omit<CandidateData, '_id'>): Promise<ApiResponse<CandidateData>> => {
    return apiRequest('/candidates', {
      method: 'POST',
      body: JSON.stringify(candidateData),
    });
  },

  /**
   * Update candidate
   */
  update: async (id: string, candidateData: Partial<CandidateData>): Promise<ApiResponse<CandidateData>> => {
    return apiRequest(`/candidates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(candidateData),
    });
  },

  /**
   * Delete candidate
   */
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest(`/candidates/${id}`, { method: 'DELETE' });
  },
};

// Interview API
export const interviewAPI = {
  /**
   * Get all interviews
   */
  getAll: async (): Promise<ApiResponse<InterviewData[]>> => {
    return apiRequest('/interviews');
  },

  /**
   * Get interview by ID
   */
  getById: async (id: string): Promise<ApiResponse<InterviewData>> => {
    return apiRequest(`/interviews/${id}`);
  },

  /**
   * Create new interview
   */
  create: async (interviewData: {
    candidateId: string;
    questions: Omit<QuestionData, '_id' | 'interview'>[];
  }): Promise<ApiResponse<InterviewData>> => {
    return apiRequest('/interviews', {
      method: 'POST',
      body: JSON.stringify(interviewData),
    });
  },

  /**
   * Update interview
   */
  update: async (id: string, interviewData: Partial<InterviewData>): Promise<ApiResponse<InterviewData>> => {
    return apiRequest(`/interviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(interviewData),
    });
  },

  /**
   * Delete interview
   */
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest(`/interviews/${id}`, { method: 'DELETE' });
  },
};

// Chat API
export const chatAPI = {
  /**
   * Get chat messages for interview
   */
  getByInterview: async (interviewId: string): Promise<ApiResponse<ChatMessageData[]>> => {
    return apiRequest(`/chat/interview/${interviewId}`);
  },

  /**
   * Create new chat message
   */
  create: async (messageData: Omit<ChatMessageData, '_id'>): Promise<ApiResponse<ChatMessageData>> => {
    return apiRequest('/chat', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  },

  /**
   * Delete chat message
   */
  delete: async (messageId: string): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest(`/chat/${messageId}`, { method: 'DELETE' });
  },
};

// AI API
export const aiAPI = {
  /**
   * Generate interview questions
   */
  generateQuestions: async (candidateId: string, jobRole: string): Promise<ApiResponse<{ questions: any[] }>> => {
    return apiRequest('/ai/generate-questions', {
      method: 'POST',
      body: JSON.stringify({ candidateId, jobRole }),
    });
  },

  /**
   * Evaluate candidate response
   */
  evaluateResponse: async (candidateId: string, question: string, response: string): Promise<ApiResponse<{
    evaluation: {
      score: number;
      feedback: string;
      strengths: string[];
      improvements: string[];
    };
  }>> => {
    return apiRequest('/ai/evaluate-response', {
      method: 'POST',
      body: JSON.stringify({ candidateId, question, response }),
    });
  },

  /**
   * Generate interview summary
   */
  generateSummary: async (candidateId: string, evaluations: any[]): Promise<ApiResponse<{
    summary: string;
    finalScore: number;
    recommendations: string[];
  }>> => {
    return apiRequest('/ai/generate-summary', {
      method: 'POST',
      body: JSON.stringify({ candidateId, evaluations }),
    });
  },

  /**
   * Initialize AI service with API key
   */
  initialize: async (apiKey: string): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest('/ai/initialize', {
      method: 'POST',
      body: JSON.stringify({ apiKey }),
    });
  },
};

// Interview Results API
export const interviewResultAPI = {
  /**
   * Save interview results
   */
  saveResults: async (candidateId: string, score: number, aiSummary: string, chatHistory: any[], answers: any[]): Promise<ApiResponse<any>> => {
    return apiRequest('/interview-results', {
      method: 'POST',
      body: JSON.stringify({ candidateId, score, aiSummary, chatHistory, answers }),
    });
  },

  /**
   * Get completed interviews
   */
  getCompletedInterviews: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest('/interview-results', { method: 'GET' });
  },

  /**
   * Get interview statistics
   */
  getStats: async (): Promise<ApiResponse<{
    totalCandidates: number;
    completedInterviews: number;
    inProgressInterviews: number;
    pendingInterviews: number;
    averageScore: number;
  }>> => {
    return apiRequest('/interview-stats', { method: 'GET' });
  },
};

// Health check
export const healthAPI = {
  check: async (): Promise<ApiResponse<{ status: string; message: string }>> => {
    return apiRequest('/health');
  },
};

export default {
  resumeAPI,
  candidateAPI,
  interviewAPI,
  chatAPI,
  aiAPI,
  interviewResultAPI,
  healthAPI,
};
