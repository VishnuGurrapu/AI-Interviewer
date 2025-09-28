import Resume from '../models/Resume.js';
import { extractDataFromResume } from '../utils/resumeParser.js';

// Upload resume
export const uploadResume = async (req, res) => {
  try {
    const { candidateId } = req.body;
    const fileUrl = req.file.path; // Assuming file upload middleware is configured
    
    // Extract data from resume
    const extractedData = await extractDataFromResume(fileUrl);
    
    const resume = new Resume({
      candidate: candidateId,
      fileUrl,
      extractedData,
    });
    
    const savedResume = await resume.save();
    res.status(201).json(savedResume);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get resume by candidate ID
export const getResumeByCandidate = async (req, res) => {
  try {
    const resume = await Resume.findOne({ candidate: req.params.candidateId });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.status(200).json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete resume
export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    // TODO: Delete file from storage
    await resume.deleteOne();
    res.status(200).json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};