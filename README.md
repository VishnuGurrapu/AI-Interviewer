# AI Interview Assistant

A full-stack MERN application for conducting AI-powered interviews with resume parsing and dynamic question generation.

## Features

- **Resume Upload & Parsing**: Upload PDF resumes and automatically extract candidate information
- **Dynamic Interview Flow**: Real-time chat interface for conducting interviews
- **AI Integration Ready**: Structured for future OpenAI integration for question generation and response evaluation
- **Real-time UI**: Modern, responsive interface with animations and progress tracking
- **Database Integration**: Full CRUD operations with MongoDB for candidates, interviews, and chat messages

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **Multer** for file uploads
- **PDF-Parse** for resume text extraction
- **CORS** for cross-origin requests

### Frontend
- **React** with TypeScript
- **Redux Toolkit** for state management
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Radix UI** components
- **Vite** for build tooling

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd assistly-interview-main
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   
   **Backend (.env file in backend directory):**
   ```env
   MONGODB_URI=mongodb://localhost:27017/ai-interviewer
   PORT=5000
   OPENAI_API_KEY=your_openai_api_key_here  # For AI features
   # Alternative: OPEN_APL_KEY=your_openai_api_key_here
   ```

   **Frontend (.env file in frontend directory):**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

### Running the Application

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on `http://localhost:5000`

3. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

4. **Test OpenAI Integration** (Optional)
   ```bash
   cd backend
   npm run test-ai
   ```

5. **Access the Application**
   Open your browser and navigate to `http://localhost:5173`

## API Endpoints

### Candidates
- `GET /api/candidates` - Get all candidates
- `GET /api/candidates/:id` - Get candidate by ID
- `POST /api/candidates` - Create new candidate
- `PUT /api/candidates/:id` - Update candidate
- `DELETE /api/candidates/:id` - Delete candidate

### Resumes
- `POST /api/resumes` - Upload and parse resume
- `GET /api/resumes/candidate/:candidateId` - Get resume by candidate
- `DELETE /api/resumes/:id` - Delete resume

### Interviews
- `GET /api/interviews` - Get all interviews
- `GET /api/interviews/:id` - Get interview by ID
- `POST /api/interviews` - Create new interview
- `PUT /api/interviews/:id` - Update interview
- `DELETE /api/interviews/:id` - Delete interview

### Chat
- `GET /api/chat/interview/:interviewId` - Get chat messages for interview
- `POST /api/chat` - Create chat message
- `DELETE /api/chat/:id` - Delete chat message

### AI (OpenAI Integration)
- `POST /api/ai/generate-questions` - Generate personalized interview questions
- `POST /api/ai/evaluate-response` - AI-powered response evaluation
- `POST /api/ai/generate-summary` - Generate comprehensive interview summary
- `POST /api/ai/initialize` - Initialize AI service with API key

## Usage

1. **Upload Resume**: Start by uploading a PDF resume
2. **Information Extraction**: The system automatically extracts name, email, phone, and other details
3. **Interview Setup**: Verify candidate information and start the interview
4. **AI-Powered Questions**: Personalized questions generated based on resume content using OpenAI
5. **Real-time Chat**: Conduct the interview through the chat interface
6. **Progress Tracking**: Monitor interview progress with visual indicators
7. **AI Evaluation & Summary**: Get comprehensive AI-powered evaluation and summary

## OpenAI Integration

✅ **Fully Integrated!** The application now includes complete OpenAI integration:

### Features:
- **Smart Question Generation**: Personalized questions based on candidate's resume and skills
- **Real-time Response Evaluation**: AI analyzes answers and provides detailed feedback
- **Intelligent Summaries**: Comprehensive interview summaries with actionable insights

### Setup:
1. **Get OpenAI API Key**: Sign up at [OpenAI Platform](https://platform.openai.com/)
2. **Add to Environment**: Set `OPENAI_API_KEY` or `OPEN_APL_KEY` in `backend/.env`
3. **Test Integration**: Run `npm run test-ai` in the backend directory
4. **Start Interviewing**: The AI will automatically enhance your interviews!

## Project Structure

```
assistly-interview-main/
├── backend/
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Custom middleware (file upload, etc.)
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API routes
│   ├── services/       # Business logic (AI service)
│   ├── utils/          # Utility functions (resume parser)
│   └── uploads/        # File upload directory
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── services/   # API service layer
│   │   ├── store/      # Redux store and slices
│   │   └── hooks/      # Custom React hooks
│   └── public/         # Static assets
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
