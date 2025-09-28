import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Download, 
  Users, 
  TrendingUp, 
  Clock,
  Filter,
  SortAsc,
  FileText
} from 'lucide-react';
import CandidateTable from './CandidateTable';
import CandidateDetails from './CandidateDetails';

const InterviewerTab: React.FC = () => {
  const { candidates, searchTerm } = useSelector((state: RootState) => state.candidates);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  // Mock data for demo purposes
  const mockCandidates = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 (555) 123-4567',
      score: 87,
      status: 'completed' as const,
      createdAt: '2024-01-15T10:30:00Z',
      chatHistory: [],
      aiSummary: 'Strong technical skills with excellent communication abilities.'
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '+1 (555) 234-5678',
      score: 72,
      status: 'completed' as const,
      createdAt: '2024-01-14T14:15:00Z',
      chatHistory: [],
      aiSummary: 'Good problem-solving skills but needs improvement in presentation.'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily.r@email.com',
      phone: '+1 (555) 345-6789',
      score: 94,
      status: 'completed' as const,
      createdAt: '2024-01-13T09:45:00Z',
      chatHistory: [],
      aiSummary: 'Outstanding candidate with leadership potential and deep technical expertise.'
    },
    {
      id: '4',
      name: 'David Kim',
      email: 'david.kim@email.com',
      phone: '+1 (555) 456-7890',
      score: 56,
      status: 'completed' as const,
      createdAt: '2024-01-12T16:20:00Z',
      chatHistory: [],
      aiSummary: 'Basic skills present but requires significant development in key areas.'
    }
  ];

  const allCandidates = [...candidates, ...mockCandidates];
  const selectedCandidate = allCandidates.find(c => c.id === selectedCandidateId);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'destructive';
  };

  const stats = {
    total: allCandidates.length,
    completed: allCandidates.filter(c => c.status === 'completed').length,
    avgScore: allCandidates.reduce((acc, c) => acc + (c.score || 0), 0) / allCandidates.length,
    highScorers: allCandidates.filter(c => (c.score || 0) >= 80).length
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card className="glass-panel-hover">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Candidates</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel-hover">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <Clock className="w-8 h-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel-hover">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold">{stats.avgScore.toFixed(1)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-warning opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel-hover">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Scorers</p>
                <p className="text-2xl font-bold">{stats.highScorers}</p>
              </div>
              <Badge className="bg-success text-success-foreground">80+</Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidates List */}
        <div className="lg:col-span-2">
          <Card className="h-[700px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Candidates</span>
                <Button variant="glass" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export All
                </Button>
              </CardTitle>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search candidates..." 
                    className="pl-10 bg-glass-background"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <SortAsc className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <CandidateTable 
                candidates={allCandidates}
                onSelectCandidate={setSelectedCandidateId}
                selectedId={selectedCandidateId}
              />
            </CardContent>
          </Card>
        </div>

        {/* Candidate Details */}
        <div>
          <Card className="h-[700px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {selectedCandidate ? 'Candidate Details' : 'Select Candidate'}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full overflow-auto">
              {selectedCandidate ? (
                <CandidateDetails candidate={selectedCandidate} />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center"
                >
                  <Users className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Candidate Selected</h3>
                  <p className="text-muted-foreground">
                    Click on a candidate from the list to view their details
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InterviewerTab;