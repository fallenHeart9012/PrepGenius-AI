const express = require('express');
const { query } = require('../config/db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Analytics Overview API
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch user's interviews
    const interviews = await query(
      `SELECT id, role, difficulty, tech_stack, status, overall_score, technical_score, communication_score, problem_solving_score, created_at, completed_at
       FROM interviews
       WHERE user_id = ?
       ORDER BY created_at ASC`,
      [userId]
    );

    const totalInterviews = interviews.length;
    const completedInterviews = interviews.filter(i => i.status === 'completed');
    const completedCount = completedInterviews.length;

    let avgOverall = 0;
    let avgTechnical = 0;
    let avgCommunication = 0;
    let avgProblemSolving = 0;
    let highestScore = 0;

    if (completedCount > 0) {
      const sumOverall = completedInterviews.reduce((acc, curr) => acc + parseFloat(curr.overall_score || 0), 0);
      const sumTech = completedInterviews.reduce((acc, curr) => acc + parseFloat(curr.technical_score || 0), 0);
      const sumComm = completedInterviews.reduce((acc, curr) => acc + parseFloat(curr.communication_score || 0), 0);
      const sumPS = completedInterviews.reduce((acc, curr) => acc + parseFloat(curr.problem_solving_score || 0), 0);

      avgOverall = parseFloat((sumOverall / completedCount).toFixed(2));
      avgTechnical = parseFloat((sumTech / completedCount).toFixed(2));
      avgCommunication = parseFloat((sumComm / completedCount).toFixed(2));
      avgProblemSolving = parseFloat((sumPS / completedCount).toFixed(2));

      highestScore = Math.max(...completedInterviews.map(i => parseFloat(i.overall_score || 0)));
    }

    // 2. Score Trends over time (for line chart)
    const scoreTrends = completedInterviews.map(i => ({
      date: new Date(i.completed_at || i.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: parseFloat(i.overall_score),
      role: i.role
    }));

    // 3. Performance breakdown by Role
    const roleMap = {};
    completedInterviews.forEach(i => {
      if (!roleMap[i.role]) {
        roleMap[i.role] = { count: 0, totalScore: 0 };
      }
      roleMap[i.role].count += 1;
      roleMap[i.role].totalScore += parseFloat(i.overall_score);
    });

    const roleBreakdown = Object.keys(roleMap).map(role => ({
      role,
      count: roleMap[role].count,
      avgScore: parseFloat((roleMap[role].totalScore / roleMap[role].count).toFixed(2))
    }));

    // 4. Radar Skills Assessment
    const skillRadar = [
      { skill: 'Technical Depth', score: avgTechnical || 7.0 },
      { skill: 'Communication', score: avgCommunication || 7.0 },
      { skill: 'Problem Solving', score: avgProblemSolving || 7.0 },
      { skill: 'Code Architecture', score: parseFloat(((avgTechnical + avgProblemSolving) / 2 || 7.0).toFixed(2)) },
      { skill: 'Articulation', score: avgCommunication || 7.0 }
    ];

    res.json({
      success: true,
      analytics: {
        summary: {
          total_interviews: totalInterviews,
          completed_interviews: completedCount,
          average_score: avgOverall,
          highest_score: highestScore,
          average_technical: avgTechnical,
          average_communication: avgCommunication,
          average_problem_solving: avgProblemSolving
        },
        score_trends: scoreTrends,
        role_breakdown: roleBreakdown,
        skill_radar: skillRadar
      }
    });
  } catch (error) {
    console.error('[Analytics Error]', error);
    res.status(500).json({ success: false, message: 'Failed to compute analytics.' });
  }
});

module.exports = router;
