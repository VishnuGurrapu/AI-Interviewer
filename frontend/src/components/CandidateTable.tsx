import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Calendar, Award } from 'lucide-react';

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
  candidates: Candidate[];
  onSelectCandidate: (id: string) => void;
  selectedId: string | null;
}

const CandidateTable: React.FC<Props> = ({ candidates, onSelectCandidate, selectedId }) => {
  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'destructive';
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'warning';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-2">
      {candidates.map((candidate, index) => (
        <motion.div
          key={candidate.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`glass-panel p-4 rounded-lg cursor-pointer transition-all hover:shadow-glass-glow ${
            selectedId === candidate.id ? 'ring-2 ring-primary shadow-glow' : ''
          }`}
          onClick={() => onSelectCandidate(candidate.id)}
        >
          <div className="grid grid-cols-12 gap-4 items-center">
            {/* Name & Email */}
            <div className="col-span-4">
              <h4 className="font-medium text-sm">{candidate.name}</h4>
              <p className="text-xs text-muted-foreground truncate">{candidate.email}</p>
            </div>

            {/* Status */}
            <div className="col-span-2">
              <Badge variant={getStatusBadgeVariant(candidate.status)} className="text-xs">
                {candidate.status.replace('-', ' ')}
              </Badge>
            </div>

            {/* Score */}
            <div className="col-span-2">
              {candidate.score ? (
                <div className="flex items-center gap-2">
                  <Badge variant={getScoreBadgeVariant(candidate.score)} className="text-xs">
                    {candidate.score}%
                  </Badge>
                  <Award className="w-3 h-3 text-muted-foreground" />
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">No score</span>
              )}
            </div>

            {/* Date */}
            <div className="col-span-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {formatDate(candidate.createdAt)}
              </div>
            </div>

            {/* Actions */}
            <div className="col-span-2 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCandidate(candidate.id);
                }}
              >
                <Eye className="w-3 h-3 mr-1" />
                View
              </Button>
            </div>
          </div>
        </motion.div>
      ))}

      {candidates.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-muted-foreground"
        >
          <div className="space-y-2">
            <Award className="w-12 h-12 mx-auto opacity-30" />
            <h3 className="font-medium">No candidates yet</h3>
            <p className="text-sm">Candidates will appear here after completing interviews</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CandidateTable;