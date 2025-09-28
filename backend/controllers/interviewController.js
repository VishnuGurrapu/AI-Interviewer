import Interview from '../models/Interview.js';
import Question from '../models/Question.js';

// Get all interviews
export const getAllInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find()
      .populate('candidate')
      .populate('questions')
      .sort({ createdAt: -1 });
    res.status(200).json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single interview
export const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('candidate')
      .populate('questions')
      .populate('chatMessages');
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    res.status(200).json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new interview
export const createInterview = async (req, res) => {
  try {
    const { candidateId, questions } = req.body;
    
    // Create interview
    const interview = new Interview({
      candidate: candidateId,
      questions: [],
    });
    
    // Create and link questions
    const questionPromises = questions.map(async (q) => {
      const question = new Question({
        text: q.text,
        difficulty: q.difficulty,
        timeLimit: q.timeLimit,
        interview: interview._id
      });
      const savedQuestion = await question.save();
      interview.questions.push(savedQuestion._id);
    });
    
    await Promise.all(questionPromises);
    const newInterview = await interview.save();
    
    res.status(201).json(await newInterview.populate('questions'));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update interview
export const updateInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    
    const { status, score, completedAt } = req.body;
    Object.assign(interview, { status, score, completedAt });
    
    const updatedInterview = await interview.save();
    res.status(200).json(updatedInterview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete interview
export const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    
    // Delete associated questions
    await Question.deleteMany({ interview: interview._id });
    await interview.deleteOne();
    
    res.status(200).json({ message: 'Interview deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};