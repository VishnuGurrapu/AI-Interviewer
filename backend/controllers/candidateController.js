import Candidate from '../models/Candidate.js';

// Get all candidates
export const getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single candidate
export const getCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    res.status(200).json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new candidate
export const createCandidate = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const candidate = new Candidate({
      name,
      email,
      phone,
    });
    const newCandidate = await candidate.save();
    res.status(201).json(newCandidate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update candidate
export const updateCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    Object.assign(candidate, req.body);
    const updatedCandidate = await candidate.save();
    res.status(200).json(updatedCandidate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete candidate
export const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    await candidate.deleteOne();
    res.status(200).json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};