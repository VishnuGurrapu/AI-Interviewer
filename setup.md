# Quick Setup Guide

## 1. Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## 2. Environment Setup

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/ai-interviewer
PORT=5000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 3. Start Services

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

## 4. Test the Application

1. Open http://localhost:5173
2. Upload a PDF resume
3. Verify information extraction
4. Start an interview
5. Test the chat interface

## 5. API Testing

Test backend health:
```bash
curl http://localhost:5000/api/health
```

## 6. Future AI Integration

When ready to add OpenAI:
1. Get OpenAI API key
2. Add to backend .env: `OPENAI_API_KEY=your_key_here`
3. Install: `cd backend && npm install openai`
4. Uncomment AI code in `backend/services/aiService.js`
