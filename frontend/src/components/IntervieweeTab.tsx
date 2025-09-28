import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, Send, Clock, FileText } from 'lucide-react';
import { 
  startInfoCollection, 
  addChatMessage, 
  startInterview, 
  setCurrentCandidate 
} from '@/store/slices/interviewSlice';
import ChatInterface from './ChatInterface';
import ResumeUpload from './ResumeUpload';
import TimerRing from './TimerRing';
import ScoreCard from './ScoreCard';

const IntervieweeTab: React.FC = () => {
  const dispatch = useDispatch();
  const { 
    currentCandidate, 
    isCollectingInfo, 
    isInterviewActive,
    currentQuestionIndex,
    questions,
    finalScore,
    aiSummary,
    chatHistory
  } = useSelector((state: RootState) => state.interview);

  const [candidateInfo, setCandidateInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const handleResumeUpload = (file: File) => {
    // Simulate resume parsing
    const extractedInfo = {
      name: 'John Doe', // Simulated extraction
      email: 'john.doe@email.com',
      phone: '+1 (555) 123-4567'
    };
    
    setCandidateInfo(extractedInfo);
    
    dispatch(setCurrentCandidate({
      id: Date.now().toString(),
      ...extractedInfo,
      resumeFile: file,
      status: 'pending',
      createdAt: new Date().toISOString()
    }));

    dispatch(startInfoCollection());
  };

  const handleStartInterview = () => {
    if (candidateInfo.name && candidateInfo.email && candidateInfo.phone) {
      dispatch(addChatMessage({
        text: `Great! Let's begin the interview. You'll have ${questions.length} questions to answer. Good luck!`,
        sender: 'bot'
      }));
      
      setTimeout(() => {
        dispatch(addChatMessage({
          text: questions[0].text,
          sender: 'bot',
          questionId: questions[0].id
        }));
        dispatch(startInterview());
      }, 1500);
    }
  };

  // Show scorecard if interview is completed
  if (finalScore !== null && aiSummary) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ScoreCard score={finalScore} summary={aiSummary} />
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      {isInterviewActive && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-4 rounded-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Interview Progress
            </span>
            <Badge variant="outline" className="bg-glass-background">
              Question {currentQuestionIndex + 1} of {questions.length}
            </Badge>
          </div>
          <Progress 
            value={((currentQuestionIndex + 1) / questions.length) * 100} 
            className="h-2"
          />
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: isInterviewActive ? 360 : 0 }}
                  transition={{ duration: 2, repeat: isInterviewActive ? Infinity : 0, ease: "linear" }}
                >
                  <FileText className="w-5 h-5 text-primary" />
                </motion.div>
                Interview Chat
                {isInterviewActive && (
                  <Badge className="bg-success text-success-foreground">
                    Live
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              {!currentCandidate ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full p-8 text-center"
                >
                  <Upload className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Upload Your Resume</h3>
                  <p className="text-muted-foreground mb-6">
                    Start by uploading your resume to begin the interview process
                  </p>
                  <ResumeUpload onUpload={handleResumeUpload} />
                </motion.div>
              ) : (
                <ChatInterface onStartInterview={handleStartInterview} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Timer (when interview is active) */}
          {isInterviewActive && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="p-6">
                <TimerRing />
              </Card>
            </motion.div>
          )}

          {/* Candidate Info */}
          {currentCandidate && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Candidate Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="font-medium">{candidateInfo.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="font-medium">{candidateInfo.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="font-medium">{candidateInfo.phone}</p>
                  </div>
                  {!isInterviewActive && !isCollectingInfo && (
                    <Button 
                      onClick={handleStartInterview}
                      className="w-full mt-4"
                      variant="gradient"
                    >
                      Start Interview
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Question Info (when interview is active) */}
          {isInterviewActive && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Question</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge 
                    variant={
                      questions[currentQuestionIndex]?.difficulty === 'easy' ? 'success' :
                      questions[currentQuestionIndex]?.difficulty === 'medium' ? 'warning' : 
                      'destructive'
                    }
                    className="mb-3"
                  >
                    {questions[currentQuestionIndex]?.difficulty?.toUpperCase()}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {questions[currentQuestionIndex]?.text}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntervieweeTab;