import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, ArrowLeft } from 'lucide-react';
import { addChatMessage, nextQuestion, updateCandidateInfo } from '@/store/slices/interviewSlice';

interface Props {
  onStartInterview: () => void;
  onGoBack?: () => void;
}

const ChatInterface: React.FC<Props> = ({ onStartInterview, onGoBack }) => {
  const dispatch = useDispatch();
  const { chatHistory, isCollectingInfo, isInterviewActive, currentCandidate } = useSelector(
    (state: RootState) => state.interview
  );
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    dispatch(addChatMessage({
      text: message,
      sender: 'user'
    }));

    setMessage('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      setIsTyping(false);
      
      if (isCollectingInfo) {
        // Handle info collection responses
        const hasEmail = currentCandidate?.email && !currentCandidate.email.includes('@example.com');
        const hasPhone = currentCandidate?.phone && currentCandidate.phone !== 'Not provided';
        
        if (!hasEmail) {
          // User just provided email
          dispatch(updateCandidateInfo({ email: message }));
          
          dispatch(addChatMessage({
            text: "Perfect! And your phone number?",
            sender: 'bot'
          }));
        } else if (!hasPhone) {
          // User just provided phone
          dispatch(updateCandidateInfo({ phone: message }));
          
          dispatch(addChatMessage({
            text: "Excellent! I have all your information. Click 'Start Interview' below when you're ready to begin.",
            sender: 'bot'
          }));
        }
      } else if (isInterviewActive) {
        dispatch(addChatMessage({
          text: "Thank you for your answer. Processing your response...",
          sender: 'bot'
        }));
        
        // Auto-advance to next question after a delay
        setTimeout(() => {
          dispatch(nextQuestion());
        }, 2000);
      } else {
        // Bot is waiting for interview to start
        dispatch(addChatMessage({
          text: "I'm ready when you are! Please click the 'Start Interview' button below to begin your interview session.",
          sender: 'bot'
        }));
      }
    }, 1500);
  };

  const TypingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex justify-start"
    >
      <div className="flex items-start gap-3 max-w-[80%]">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="bg-glass-background backdrop-blur-glass rounded-lg px-4 py-2 border border-glass-border">
          <div className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {chatHistory.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.sender === 'user' ? 'bg-chat-user' : 'bg-primary'
                }`}>
                  {msg.sender === 'user' ? 
                    <User className="w-4 h-4 text-chat-user-foreground" /> : 
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  }
                </div>
                <div className={`rounded-lg px-4 py-2 break-words ${
                  msg.sender === 'user' 
                    ? 'bg-chat-user text-chat-user-foreground' 
                    : 'bg-glass-background backdrop-blur-glass border border-glass-border text-foreground'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <span className="text-xs opacity-60 mt-1 block">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-glass-border">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              isCollectingInfo 
                ? "Type your response..." 
                : isInterviewActive 
                ? "Type your answer..." 
                : "Ready to start?"
            }
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="bg-glass-background border-glass-border"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim()}
            variant="gradient"
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {!isInterviewActive && (
          <div className="mt-3 space-y-2">
            {(() => {
              const hasEmail = currentCandidate?.email && !currentCandidate.email.includes('@example.com');
              const hasPhone = currentCandidate?.phone && currentCandidate.phone !== 'Not provided';
              const canStartInterview = hasEmail && hasPhone;
              
              return (
                <>
                  <Button 
                    onClick={onStartInterview} 
                    variant="gradient" 
                    className="w-full"
                    disabled={!canStartInterview}
                  >
                    {canStartInterview ? 'Start Interview' : 'Complete Info First'}
                  </Button>
                  {onGoBack && (
                    <Button onClick={onGoBack} variant="outline" className="w-full">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Upload Different Resume
                    </Button>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;