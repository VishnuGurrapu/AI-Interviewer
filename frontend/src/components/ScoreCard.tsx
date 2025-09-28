import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { 
  Trophy, 
  Star, 
  CheckCircle, 
  TrendingUp, 
  Download,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { resetInterview } from '@/store/slices/interviewSlice';

interface Props {
  score: number;
  summary: string;
}

const ScoreCard: React.FC<Props> = ({ score, summary }) => {
  const dispatch = useDispatch();

  const getScoreLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent', color: '#10b981', icon: Trophy, badge: 'success' as const };
    if (score >= 80) return { level: 'Very Good', color: '#059669', icon: Star, badge: 'success' as const };
    if (score >= 70) return { level: 'Good', color: '#f59e0b', icon: CheckCircle, badge: 'warning' as const };
    if (score >= 60) return { level: 'Average', color: '#f97316', icon: TrendingUp, badge: 'warning' as const };
    return { level: 'Needs Improvement', color: '#ef4444', icon: RefreshCw, badge: 'destructive' as const };
  };

  const scoreInfo = getScoreLevel(score);
  const ScoreIcon = scoreInfo.icon;

  const handleNewInterview = () => {
    dispatch(resetInterview());
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: "spring" }}
      className="max-w-2xl mx-auto"
    >
      <Card className="overflow-hidden">
        {/* Header with animated background */}
        <CardHeader className="relative bg-gradient-primary text-primary-foreground">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center relative z-10"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, delay: 0.5 }}
              className="w-16 h-16 mx-auto mb-4 glass-panel rounded-full flex items-center justify-center"
            >
              <Trophy className="w-8 h-8 text-primary" />
            </motion.div>
            <CardTitle className="text-3xl font-bold mb-2">Interview Complete!</CardTitle>
            <p className="opacity-90">Congratulations on completing your interview</p>
          </motion.div>
          
          {/* Floating elements */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            className="absolute top-4 right-4"
          >
            <Sparkles className="w-6 h-6 opacity-60" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 2 }}
            className="absolute bottom-4 left-4"
          >
            <Sparkles className="w-4 h-4 opacity-40" />
          </motion.div>
        </CardHeader>

        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Score Visualization */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <h3 className="text-xl font-semibold mb-6">Your Score</h3>
              
              <div className="relative w-48 h-48 mx-auto mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                >
                  <CircularProgressbar
                    value={score}
                    text={`${score}%`}
                    styles={buildStyles({
                      pathColor: scoreInfo.color,
                      textColor: 'hsl(var(--foreground))',
                      trailColor: 'hsla(var(--glass-border))',
                      backgroundColor: 'transparent',
                      textSize: '18px',
                      pathTransitionDuration: 2,
                    })}
                  />
                </motion.div>
                
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div className="w-20 h-20 glass-panel rounded-full flex items-center justify-center">
                    <ScoreIcon className="w-8 h-8" style={{ color: scoreInfo.color }} />
                  </div>
                </motion.div>
              </div>

              <Badge variant={scoreInfo.badge} className="text-base px-4 py-2">
                {scoreInfo.level}
              </Badge>
            </motion.div>

            {/* AI Summary */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold">AI Assessment</h3>
              
              <div className="glass-panel p-6 rounded-lg">
                <p className="text-muted-foreground leading-relaxed">{summary}</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Performance Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Communication</span>
                    <div className="w-24 h-2 glass-panel rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(score + 10, 100)}%` }}
                        transition={{ delay: 1, duration: 1 }}
                        className="h-full bg-success"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Technical Knowledge</span>
                    <div className="w-24 h-2 glass-panel rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ delay: 1.2, duration: 1 }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Problem Solving</span>
                    <div className="w-24 h-2 glass-panel rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(score - 5, 0)}%` }}
                        transition={{ delay: 1.4, duration: 1 }}
                        className="h-full bg-warning"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-glass-border"
          >
            <Button variant="gradient" size="lg" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
            <Button variant="outline" size="lg" onClick={handleNewInterview} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Take Another Interview
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ScoreCard;