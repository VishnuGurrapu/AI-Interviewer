import ChatMessage from '../models/ChatMessage.js';
import Interview from '../models/Interview.js';

// Get chat messages for an interview
export const getChatMessages = async (req, res) => {
  try {
    const messages = await ChatMessage.find({ interview: req.params.interviewId })
      .sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new chat message
export const createChatMessage = async (req, res) => {
  try {
    const { interviewId, sender, text } = req.body;
    
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    
    const message = new ChatMessage({
      interview: interviewId,
      sender,
      text,
    });
    
    const savedMessage = await message.save();
    interview.chatMessages.push(savedMessage._id);
    await interview.save();
    
    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete chat message
export const deleteChatMessage = async (req, res) => {
  try {
    const message = await ChatMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    const interview = await Interview.findById(message.interview);
    if (interview) {
      interview.chatMessages = interview.chatMessages.filter(
        (msgId) => msgId.toString() !== message._id.toString()
      );
      await interview.save();
    }
    
    await message.deleteOne();
    res.status(200).json({ message: 'Chat message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};