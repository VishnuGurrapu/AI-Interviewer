import Resume from '../models/Resume.js';
import Candidate from '../models/Candidate.js';
import { extractDataFromResume } from '../utils/resumeParser.js';
import { safeExtractResumeData } from '../utils/safePdfParser.js';
import { robustExtractResumeData } from '../utils/robustPdfParser.js';

// Upload resume and create/update candidate
export const uploadResume = async (req, res) => {
  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Validate candidateId
    const { candidateId } = req.body;
    if (!candidateId) {
      return res.status(400).json({ message: 'candidateId is required in the request body' });
    }

    // Validate if candidate exists
    const existingCandidate = await Candidate.findById(candidateId);
    if (!existingCandidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    const filePath = req.file.path;
    
    // Extract data from resume using robust parser
    console.log('[Resume Controller] Starting resume extraction...');
    let extractedData;
    
    try {
      // Try the robust parser first (handles pdf-parse issues)
      extractedData = await robustExtractResumeData(filePath);
      console.log('[Resume Controller] ✅ Robust extraction result:', {
        name: extractedData.name,
        email: extractedData.email,
        phone: extractedData.phone,
        hasError: extractedData.parseError,
        fromPDF: extractedData.extractedFromPDF
      });
    } catch (error) {
      console.log('[Resume Controller] ⚠️ Robust parser failed, trying safe parser...');
      try {
        extractedData = await safeExtractResumeData(filePath);
        console.log('[Resume Controller] Safe parser result:', extractedData);
      } catch (safeError) {
        console.log('[Resume Controller] ⚠️ Safe parser also failed, trying original parser...');
        extractedData = await extractDataFromResume(filePath);
        console.log('[Resume Controller] Original parser result:', extractedData);
      }
    }
    
    // Update candidate with extracted data if available
    let candidate = existingCandidate;
    if (extractedData) {
      candidate = await Candidate.findByIdAndUpdate(
        candidateId,
        {
          $set: {
            ...(extractedData.name && { name: extractedData.name }),
            ...(extractedData.email && { email: extractedData.email }),
            ...(extractedData.phone && { phone: extractedData.phone })
          }
        },
        { new: true }
      );
    }

    // Check for existing resume
    const existingResume = await Resume.findOne({ candidate: candidateId });
    if (existingResume) {
      // Update existing resume
      const updatedResume = await Resume.findByIdAndUpdate(
        existingResume._id,
        {
          fileUrl: filePath,
          extractedData,
          uploadedAt: new Date()
        },
        { new: true }
      );
      
      return res.status(200).json({
        message: 'Resume updated successfully',
        candidate,
        resume: updatedResume,
        extractedData
      });
    }
    
    // Create new resume
    const resume = new Resume({
      candidate: candidateId,
      fileUrl: filePath,
      extractedData,
    });
    
    const savedResume = await resume.save();
    
    res.status(201).json({
      message: 'Resume uploaded successfully',
      candidate,
      resume: savedResume,
      extractedData
    });
  } catch (error) {
    console.error('Resume upload error:', error);
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