import mongoose from 'mongoose';

const InterviewSchema = new mongoose.Schema({
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  chatMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ChatMessage' }],
  score: { type: Number },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

export default mongoose.model('Interview', InterviewSchema);