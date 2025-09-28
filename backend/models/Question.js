import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  timeLimit: { type: Number, required: true }, // in seconds
  answer: { type: String },
  interview: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview' },
});

export default mongoose.model('Question', QuestionSchema);