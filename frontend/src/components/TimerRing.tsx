import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { Clock, AlertTriangle } from 'lucide-react';
import { updateTimeRemaining } from '@/store/slices/interviewSlice';
import 'react-circular-progressbar/dist/styles.css';

const TimerRing: React.FC = () => {
  const dispatch = useDispatch();
  const { timeRemaining, questions, currentQuestionIndex, isInterviewActive } = useSelector(
    (state: RootState) => state.interview
  );

  const currentQuestion = questions[currentQuestionIndex];
  const totalTime = currentQuestion?.timeLimit || 0;
  const percentage = totalTime > 0 ? (timeRemaining / totalTime) * 100 : 0;

  useEffect(() => {
    if (!isInterviewActive || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      dispatch(updateTimeRemaining(timeRemaining - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, isInterviewActive, dispatch]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getColorByTime = () => {
    if (percentage > 50) return '#10b981'; // green
    if (percentage > 25) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Clock className="w-5 h-5 text-primary" />
        Time Remaining
      </div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-32 h-32"
      >
        <CircularProgressbar
          value={percentage}
          text={formatTime(timeRemaining)}
          styles={buildStyles({
            pathColor: getColorByTime(),
            textColor: 'hsl(var(--foreground))',
            trailColor: 'hsla(var(--glass-border))',
            backgroundColor: 'transparent',
            textSize: '16px',
            pathTransitionDuration: 1,
          })}
        />
        
        {percentage <= 25 && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="absolute -top-2 -right-2"
          >
            <div className="w-6 h-6 bg-destructive rounded-full flex items-center justify-center">
              <AlertTriangle className="w-3 h-3 text-destructive-foreground" />
            </div>
          </motion.div>
        )}
      </motion.div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {currentQuestion?.difficulty?.toUpperCase()} - {Math.floor(totalTime / 60)}min limit
        </p>
      </div>

      {percentage <= 10 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-3 glass-panel rounded-lg border-l-4 border-l-destructive"
        >
          <p className="text-sm font-medium text-destructive">
            ⚠️ Time almost up!
          </p>
          <p className="text-xs text-muted-foreground">
            Question will auto-submit when timer reaches zero
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default TimerRing;