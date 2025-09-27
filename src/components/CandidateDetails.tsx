import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Mail, 
  Phone, 
  Calendar, 
  Award, 
  MessageSquare,
  Download,
  User,
  Brain
} from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  score?: number;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  aiSummary?: string;
}

interface Props {
  candidate: Candidate;
}

const CandidateDetails: React.FC<Props> = ({ candidate }) => {
  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'destructive';
  };

  const getScoreLevel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Average';
    return 'Needs Improvement';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-lg">
                {getInitials(candidate.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{candidate.name}</h3>
              <p className="text-muted-foreground">Candidate ID: {candidate.id}</p>
              <Badge variant="outline" className="mt-2">
                {candidate.status.replace('-', ' ')}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{candidate.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{candidate.phone}</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{formatDate(candidate.createdAt)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Score & Performance */}
      {candidate.score && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5" />
              Performance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold mb-2">{candidate.score}%</div>
              <Badge variant={getScoreBadgeVariant(candidate.score)} className="text-base px-3 py-1">
                {getScoreLevel(candidate.score)}
              </Badge>
            </div>
            
            {/* Performance Breakdown */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Performance Breakdown</h4>
              <div className="space-y-2">
                {[
                  { label: 'Communication', value: Math.min(candidate.score + 10, 100) },
                  { label: 'Technical Knowledge', value: candidate.score },
                  { label: 'Problem Solving', value: Math.max(candidate.score - 5, 0) },
                ].map((metric) => (
                  <div key={metric.label} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{metric.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 glass-panel rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${metric.value}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="h-full bg-primary"
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{metric.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Summary */}
      {candidate.aiSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="glass-panel p-4 rounded-lg">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {candidate.aiSummary}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Interview Chat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="glass-panel p-4 rounded-lg text-center">
            <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">
              Chat history will be available here
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Full conversation log with timestamps
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-3">
        <Button variant="gradient" className="w-full">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
        <Button variant="outline" className="w-full">
          <MessageSquare className="w-4 h-4 mr-2" />
          View Full Chat
        </Button>
      </div>
    </motion.div>
  );
};

export default CandidateDetails;