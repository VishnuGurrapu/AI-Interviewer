import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Users, Brain } from 'lucide-react';
import IntervieweeTab from './IntervieweeTab';
import InterviewerTab from './InterviewerTab';

const InterviewLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto p-6"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 glass-panel rounded-xl">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AI Interview Assistant
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Intelligent interview platform with real-time assessment
          </p>
        </motion.div>

        {/* Main Tabs */}
        <Tabs defaultValue="interviewee" className="w-full max-w-7xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 glass-panel mb-8">
            <TabsTrigger 
              value="interviewee" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <MessageCircle className="w-4 h-4" />
              Interviewee (Chat)
            </TabsTrigger>
            <TabsTrigger 
              value="interviewer"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Users className="w-4 h-4" />
              Interviewer (Dashboard)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="interviewee" className="mt-0">
            <IntervieweeTab />
          </TabsContent>

          <TabsContent value="interviewer" className="mt-0">
            <InterviewerTab />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default InterviewLayout;