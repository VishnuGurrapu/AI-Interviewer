import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, Send, Clock, FileText, AlertCircle, ArrowLeft } from 'lucide-react';
import { 
  startInfoCollection, 
  addChatMessage, 
  startInterview, 
  setCurrentCandidate,
  resetInterview,
  completeInterview
} from '@/store/slices/interviewSlice';
import { resumeAPI, candidateAPI, interviewAPI, aiAPI, interviewResultAPI } from '@/services/api';
import ChatInterface from './ChatInterface';
import ResumeUpload from './ResumeUpload';
import TimerRing from './TimerRing';
import ScoreCard from './ScoreCard';
import NameInputDialog from './NameInputDialog';

const IntervieweeTab: React.FC = () => {
  const dispatch = useDispatch();
  const { 
    currentCandidate, 
    isCollectingInfo, 
    isInterviewActive,
    currentQuestionIndex,
    questions = [],
    finalScore,
    aiSummary,
    chatHistory = []
  } = useSelector((state: RootState) => state.interview);

  const [candidateInfo, setCandidateInfo] = useState({
    name: 'Unknown Candidate',
    email: `candidate${Date.now()}@example.com`,
    phone: 'Not provided'
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentCandidateId, setCurrentCandidateId] = useState<string | null>(null);
  const [candidateName, setCandidateName] = useState<string | null>(null);
  const [showNameDialog, setShowNameDialog] = useState(true);

  const handleNameSubmit = (name: string) => {
    console.log('[Frontend] Candidate name submitted:', name);
    setCandidateName(name);
    setCandidateInfo(prev => ({ ...prev, name }));
    setShowNameDialog(false);
    
    // Show welcome message
    dispatch(startInfoCollection());
  };

  const handleGoBack = () => {
    // Reset all states to go back to name input
    setCandidateInfo({
      name: 'Unknown Candidate',
      email: `candidate${Date.now()}@example.com`,
      phone: 'Not provided'
    });
    setCurrentCandidateId(null);
    setUploadError(null);
    setCandidateName(null);
    setShowNameDialog(true);
    
    // Reset interview state completely
    dispatch(resetInterview());
  };

  const handleResumeUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    
    try {
      // Step 1: Create candidate with the provided name
      const tempCandidateData = {
        name: candidateName || 'Unknown Candidate',
        email: `candidate${Date.now()}@example.com`,
        phone: 'Not provided',
        status: 'pending' as const
      };
      
      const candidateResponse = await candidateAPI.create(tempCandidateData);
      
      if (candidateResponse.error || !candidateResponse.data) {
        throw new Error(candidateResponse.error || 'Failed to create candidate');
      }
      
      const createdCandidateId = candidateResponse.data._id;
      if (!createdCandidateId) {
        throw new Error('No candidate ID returned');
      }
      
      // Step 2: Upload resume with candidateId
      const response = await resumeAPI.upload(file, createdCandidateId);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        const { candidate, extractedData } = response.data;
        
        const extractedInfo = {
          name: extractedData.name || 'Unknown Candidate',
          email: extractedData.email || `candidate${Date.now()}@example.com`,
          phone: extractedData.phone || 'Not provided'
        };
        
        console.log('[Frontend] Setting candidate info:', extractedInfo);
        setCandidateInfo(extractedInfo);
        setCurrentCandidateId(candidate._id || null);
        
        // Check if parsing was successful
        const hasValidName = extractedData.name && extractedData.name !== 'Unknown Candidate';
        const hasValidEmail = extractedData.email && !extractedData.email.includes('candidate') && !extractedData.email.includes('@example.com');
        const hasValidPhone = extractedData.phone && extractedData.phone !== 'Not provided';
        
        dispatch(setCurrentCandidate({
          ...candidate,
          id: candidate._id || '',
          createdAt: candidate.createdAt || new Date().toISOString()
        }));
        
        // Provide feedback based on parsing success
        if (hasValidName && hasValidEmail && hasValidPhone) {
          dispatch(addChatMessage({
            text: `Excellent! I've successfully parsed your resume and extracted all your information.`,
            sender: 'bot'
          }));
          
          dispatch(addChatMessage({
            text: `I found: Name: ${extractedData.name}, Email: ${extractedData.email}, Phone: ${extractedData.phone}.`,
            sender: 'bot'
          }));
          
          dispatch(addChatMessage({
            text: `All set! Click "Start Interview" below when you're ready to begin.`,
            sender: 'bot'
          }));
        } else if (hasValidName || hasValidEmail || hasValidPhone) {
          dispatch(addChatMessage({
            text: `Great! I've parsed your resume and extracted some information. Let me verify and collect any missing details.`,
            sender: 'bot'
          }));
          
          const foundInfo = [];
          if (hasValidName) foundInfo.push(`Name: ${extractedData.name}`);
          if (hasValidEmail) foundInfo.push(`Email: ${extractedData.email}`);
          if (hasValidPhone) foundInfo.push(`Phone: ${extractedData.phone}`);
          
          if (foundInfo.length > 0) {
            dispatch(addChatMessage({
              text: `I found: ${foundInfo.join(', ')}. Let me collect the missing information.`,
              sender: 'bot'
            }));
          }
          
          // Start collecting missing information
          if (!hasValidName) {
            dispatch(addChatMessage({
              text: `I couldn't extract your name from the resume. Could you please tell me your full name?`,
              sender: 'bot'
            }));
          } else if (!hasValidEmail) {
            dispatch(addChatMessage({
              text: `I couldn't find your email address. Could you please provide your email?`,
              sender: 'bot'
            }));
          } else if (!hasValidPhone) {
            dispatch(addChatMessage({
              text: `I couldn't find your phone number. Could you please provide your phone number?`,
              sender: 'bot'
            }));
          }
        } else {
          dispatch(addChatMessage({
            text: `I've received your resume, but I had trouble extracting your personal information. Let me collect your details manually.`,
            sender: 'bot'
          }));
          
          dispatch(addChatMessage({
            text: `Let's start with your full name. What should I call you?`,
            sender: 'bot'
          }));
        }
      }
    } catch (error) {
      console.error('Resume upload failed:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
      
      dispatch(addChatMessage({
        text: `I'm sorry, there was an error processing your resume. Please try uploading again or enter your information manually.`,
        sender: 'bot'
      }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartInterview = async () => {
    if (candidateInfo.name && candidateInfo.email && candidateInfo.phone && currentCandidateId) {
      try {
        dispatch(addChatMessage({
          text: `Perfect! Let me generate personalized interview questions based on your resume. This will take just a moment...`,
          sender: 'bot'
        }));

        // Generate AI-powered questions based on resume with timeout
        let aiQuestions = questions; // fallback to default questions
        
        try {
          const questionsResponse = await Promise.race([
            aiAPI.generateQuestions(currentCandidateId, 'Software Developer'),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Question generation timeout')), 10000)
            )
          ]) as Awaited<ReturnType<typeof aiAPI.generateQuestions>>;
          
          if (questionsResponse && 'data' in questionsResponse && questionsResponse.data && questionsResponse.data.questions && questionsResponse.data.questions.length > 0) {
            // Convert AI questions to frontend format
            aiQuestions = questionsResponse.data.questions.map((q: any, index: number) => ({
              id: q.id || (index + 1).toString(),
              text: q.text,
              difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
              timeLimit: q.timeLimit
            }));
            console.log('✅ Generated AI questions:', aiQuestions);
            
            dispatch(addChatMessage({
              text: `Excellent! I've generated ${aiQuestions.length} personalized questions based on your background and skills.`,
              sender: 'bot'
            }));
          } else {
            console.log('⚠️ Using default questions as fallback (empty response)');
            dispatch(addChatMessage({
              text: `I'll use our standard interview questions for you today.`,
              sender: 'bot'
            }));
          }
        } catch (aiError) {
          console.error('⚠️ AI question generation failed:', aiError);
          console.log('⚠️ Using default questions as fallback');
          dispatch(addChatMessage({
            text: `I'll use our standard interview questions for you today.`,
            sender: 'bot'
          }));
        }

        // Create interview in backend with generated questions
        const interviewResponse = await interviewAPI.create({
          candidateId: currentCandidateId,
          questions: aiQuestions.map(q => ({
            text: q.text,
            difficulty: q.difficulty,
            timeLimit: q.timeLimit
          }))
        });
        
        if (interviewResponse.error) {
          throw new Error(interviewResponse.error);
        }
        
        dispatch(addChatMessage({
          text: `Great! Let's begin the interview. You'll have ${aiQuestions.length} questions to answer. Good luck!`,
          sender: 'bot'
        }));
        
        setTimeout(() => {
          dispatch(addChatMessage({
            text: aiQuestions[0].text,
            sender: 'bot',
            questionId: aiQuestions[0].id
          }));
          dispatch(startInterview());
        }, 2000);
        
      } catch (error) {
        console.error('❌ Failed to start interview:', error);
        dispatch(addChatMessage({
          text: `I'm sorry, there was an error starting the interview: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
          sender: 'bot'
        }));
      }
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
          <Card className="h-[600px] flex flex-col overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: isInterviewActive ? 360 : 0 }}
                  transition={{ duration: 2, repeat: isInterviewActive ? Infinity : 0, ease: "linear" }}
                >
                  <FileText className="w-5 h-5 text-primary" />
                </motion.div>
                <span>Interview Chat</span>
                {isInterviewActive && (
                  <Badge className="bg-success text-success-foreground">
                    Live
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 min-h-0">
              {showNameDialog ? (
                <NameInputDialog onSubmit={handleNameSubmit} isLoading={false} />
              ) : !currentCandidate ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full p-8 text-center">
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
                      <h3 className="text-xl font-semibold mb-2">Processing Resume</h3>
                      <p className="text-muted-foreground mb-6">
                        Please wait while we extract information from your resume using AI...
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-16 h-16 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        Welcome, {candidateName}!
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Upload your resume to continue with the interview process
                      </p>
                      {uploadError && (
                        <div className="flex items-center gap-2 text-destructive mb-4 p-3 bg-destructive/10 rounded-lg">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">{uploadError}</span>
                        </div>
                      )}
                      <ResumeUpload onUpload={handleResumeUpload} disabled={isUploading} />
                    </>
                  )}
                </motion.div>
              ) : (
                <ChatInterface onStartInterview={handleStartInterview} onGoBack={handleGoBack} />
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
                    <div className="space-y-2 mt-4">
                      <Button 
                        onClick={handleStartInterview}
                        className="w-full"
                        variant="gradient"
                      >
                        Start Interview
                      </Button>
                      <Button 
                        onClick={handleGoBack}
                        className="w-full"
                        variant="outline"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Upload New Resume
                      </Button>
                    </div>
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
                  <p className="text-sm text-muted-foreground mb-4">
                    {questions[currentQuestionIndex]?.text}
                  </p>
                  <Button 
                    onClick={handleGoBack}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Restart Interview
                  </Button>
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