import Candidate from '../models/Candidate.js';
import Interview from '../models/Interview.js';

// Save interview results
export const saveInterviewResult = async (req, res) => {
  try {
    const { candidateId, score, aiSummary, chatHistory, answers } = req.body;

    console.log('[Interview Result] Saving results for candidate:', candidateId);

    // Update candidate with final score and summary
    const updatedCandidate = await Candidate.findByIdAndUpdate(
      candidateId,
      {
        score: score,
        aiSummary: aiSummary,
        status: 'completed'
      },
      { new: true }
    );

    if (!updatedCandidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Create or update interview record
    const interviewData = {
      candidateId: candidateId,
      score: score,
      aiSummary: aiSummary,
      chatHistory: chatHistory || [],
      answers: answers || [],
      completedAt: new Date(),
      status: 'completed'
    };

    let interview = await Interview.findOne({ candidateId });
    
    if (interview) {
      // Update existing interview
      interview = await Interview.findByIdAndUpdate(
        interview._id,
        interviewData,
        { new: true }
      );
    } else {
      // Create new interview
      interview = new Interview(interviewData);
      await interview.save();
    }

    console.log('[Interview Result] ✅ Results saved successfully');

    res.status(200).json({
      message: 'Interview results saved successfully',
      data: {
        candidate: updatedCandidate,
        interview: interview
      }
    });

  } catch (error) {
    console.error('[Interview Result] ❌ Error saving results:', error);
    res.status(500).json({ 
      message: 'Failed to save interview results',
      error: error.message 
    });
  }
};

// Get all completed interviews for dashboard
export const getCompletedInterviews = async (req, res) => {
  try {
    console.log('[Interview Result] Fetching completed interviews...');

    // Get all completed candidates with their interview data
    const completedCandidates = await Candidate.find({ 
      status: 'completed',
      score: { $exists: true }
    }).sort({ createdAt: -1 });

    // Get interview details for each candidate
    const candidatesWithInterviews = await Promise.all(
      completedCandidates.map(async (candidate) => {
        const interview = await Interview.findOne({ candidateId: candidate._id });
        return {
          id: candidate._id,
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          score: candidate.score,
          status: candidate.status,
          createdAt: candidate.createdAt,
          aiSummary: candidate.aiSummary,
          chatHistory: interview ? interview.chatHistory : [],
          answers: interview ? interview.answers : []
        };
      })
    );

    console.log(`[Interview Result] ✅ Found ${candidatesWithInterviews.length} completed interviews`);

    res.status(200).json({
      message: 'Completed interviews fetched successfully',
      data: candidatesWithInterviews
    });

  } catch (error) {
    console.error('[Interview Result] ❌ Error fetching interviews:', error);
    res.status(500).json({ 
      message: 'Failed to fetch completed interviews',
      error: error.message 
    });
  }
};

// Get interview statistics
export const getInterviewStats = async (req, res) => {
  try {
    console.log('[Interview Result] Calculating interview statistics...');

    const totalCandidates = await Candidate.countDocuments();
    const completedInterviews = await Candidate.countDocuments({ status: 'completed' });
    const inProgressInterviews = await Candidate.countDocuments({ status: 'in-progress' });
    const pendingInterviews = await Candidate.countDocuments({ status: 'pending' });

    // Calculate average score
    const completedCandidatesWithScores = await Candidate.find({ 
      status: 'completed',
      score: { $exists: true, $ne: null }
    });

    const averageScore = completedCandidatesWithScores.length > 0 
      ? completedCandidatesWithScores.reduce((sum, candidate) => sum + (candidate.score || 0), 0) / completedCandidatesWithScores.length
      : 0;

    const stats = {
      totalCandidates,
      completedInterviews,
      inProgressInterviews,
      pendingInterviews,
      averageScore: Math.round(averageScore * 100) / 100
    };

    console.log('[Interview Result] ✅ Statistics calculated:', stats);

    res.status(200).json({
      message: 'Interview statistics fetched successfully',
      data: stats
    });

  } catch (error) {
    console.error('[Interview Result] ❌ Error calculating statistics:', error);
    res.status(500).json({ 
      message: 'Failed to calculate interview statistics',
      error: error.message 
    });
  }
};
