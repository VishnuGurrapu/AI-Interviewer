import mongoose from 'mongoose';

const ChatMessageSchema = new mongoose.Schema({
  interview: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true },
  sender: { type: String, enum: ['user', 'bot'], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model('ChatMessage', ChatMessageSchema);