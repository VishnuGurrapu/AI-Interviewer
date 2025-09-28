import mongoose from 'mongoose';

const ResumeSchema = new mongoose.Schema({
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  fileUrl: { type: String, required: true },
  extractedData: { type: mongoose.Schema.Types.Mixed }, // { name, email, phone }
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Resume', ResumeSchema);