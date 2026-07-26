const express = require('express');
const { query } = require('../config/db');
const authenticateToken = require('../middleware/auth');
const aiService = require('../services/ai.service');

const router = express.Router();

// Start a new Mock Interview (With optional Resume-tailored questions)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { role, difficulty, tech_stack, total_questions, resume_text } = req.body;

    if (!role || !difficulty || !tech_stack) {
      return res.status(400).json({ success: false, message: 'Role, difficulty level, and tech stack are required.' });
    }

    const questionCount = parseInt(total_questions || 5, 10);

    // 1. Create interview record
    const interviewResult = await query(
      `INSERT INTO interviews (user_id, role, difficulty, tech_stack, total_questions, status)
       VALUES (?, ?, ?, ?, ?, 'in_progress')`,
      [req.user.id, role, difficulty, tech_stack, questionCount]
    );

    const interviewId = interviewResult.insertId;

    // 2. Generate questions via AI Service (passing resume_text if provided)
    const aiQuestions = await aiService.generateQuestions({
      role,
      difficulty,
      techStack: tech_stack,
      count: questionCount,
      resumeText: resume_text || ''
    });

    // 3. Save questions to DB
    const savedQuestions = [];
    for (const q of aiQuestions) {
      const qResult = await query(
        `INSERT INTO questions (interview_id, question_order, question_text, category, hints)
         VALUES (?, ?, ?, ?, ?)`,
        [interviewId, q.order, q.text, q.category, q.hints]
      );
      savedQuestions.push({
        id: qResult.insertId,
        question_order: q.order,
        question_text: q.text,
        category: q.category,
        hints: q.hints
      });
    }

    res.status(201).json({
      success: true,
      message: 'Mock interview session created successfully.',
      interview: {
        id: interviewId,
        role,
        difficulty,
        tech_stack,
        total_questions: questionCount,
        status: 'in_progress',
        questions: savedQuestions
      }
    });
  } catch (error) {
    console.error('[Create Interview Error]', error);
    res.status(500).json({ success: false, message: 'Failed to create mock interview session.' });
  }
});

// Get User's Interviews List
router.get('/', authenticateToken, async (req, res) => {
  try {
    const interviews = await query(
      `SELECT * FROM interviews WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      interviews
    });
  } catch (error) {
    console.error('[Get Interviews Error]', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve interview history.' });
  }
});

// Get Single Interview Details with Questions & Evaluation Scores
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const interviewId = parseInt(req.params.id, 10);
    const interviews = await query(
      `SELECT * FROM interviews WHERE id = ? AND user_id = ?`,
      [interviewId, req.user.id]
    );

    if (interviews.length === 0) {
      return res.status(404).json({ success: false, message: 'Interview session not found.' });
    }

    const interview = interviews[0];

    const questions = await query(
      `SELECT * FROM questions WHERE interview_id = ? ORDER BY question_order ASC`,
      [interviewId]
    );

    const answers = await query(
      `SELECT a.id as answer_id, a.question_id, a.user_answer, a.created_at as answered_at,
              s.id as score_id, s.score, s.technical_score, s.communication_score, s.problem_solving_score,
              s.technical_feedback, s.communication_feedback, s.areas_for_improvement, s.sample_ideal_answer
       FROM answers a
       LEFT JOIN scores s ON a.id = s.answer_id
       WHERE a.interview_id = ?`,
      [interviewId]
    );

    const formattedQuestions = questions.map(q => {
      const ans = answers.find(a => a.question_id === q.id);
      return {
        ...q,
        answer: ans ? {
          id: ans.answer_id,
          user_answer: ans.user_answer,
          answered_at: ans.answered_at,
          score: ans.score_id ? {
            score: ans.score,
            technical_score: ans.technical_score,
            communication_score: ans.communication_score,
            problem_solving_score: ans.problem_solving_score,
            technical_feedback: ans.technical_feedback,
            communication_feedback: ans.communication_feedback,
            areas_for_improvement: ans.areas_for_improvement,
            sample_ideal_answer: ans.sample_ideal_answer
          } : null
        } : null
      };
    });

    res.json({
      success: true,
      interview: {
        ...interview,
        questions: formattedQuestions
      }
    });
  } catch (error) {
    console.error('[Get Interview Details Error]', error);
    res.status(500).json({ success: false, message: 'Failed to fetch interview details.' });
  }
});

// Submit Answer to Question & Trigger AI Evaluation
router.post('/:id/answer', authenticateToken, async (req, res) => {
  try {
    const interviewId = parseInt(req.params.id, 10);
    const { question_id, user_answer } = req.body;

    if (!question_id || !user_answer) {
      return res.status(400).json({ success: false, message: 'Question ID and User Answer are required.' });
    }

    const interviews = await query(
      `SELECT * FROM interviews WHERE id = ? AND user_id = ?`,
      [interviewId, req.user.id]
    );

    if (interviews.length === 0) {
      return res.status(404).json({ success: false, message: 'Interview session not found.' });
    }

    const interview = interviews[0];

    const questions = await query(
      `SELECT * FROM questions WHERE id = ? AND interview_id = ?`,
      [question_id, interviewId]
    );

    if (questions.length === 0) {
      return res.status(404).json({ success: false, message: 'Question not found for this interview.' });
    }

    const question = questions[0];

    const answerResult = await query(
      `INSERT INTO answers (interview_id, question_id, user_answer) VALUES (?, ?, ?)`,
      [interviewId, question_id, user_answer]
    );

    const answerId = answerResult.insertId;

    const evaluation = await aiService.evaluateAnswer({
      questionText: question.question_text,
      category: question.category,
      userAnswer: user_answer,
      role: interview.role,
      difficulty: interview.difficulty
    });

    await query(
      `INSERT INTO scores (
        answer_id, score, technical_score, communication_score, problem_solving_score,
        technical_feedback, communication_feedback, areas_for_improvement, sample_ideal_answer
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        answerId,
        evaluation.score,
        evaluation.technical_score,
        evaluation.communication_score,
        evaluation.problem_solving_score,
        evaluation.technical_feedback,
        evaluation.communication_feedback,
        evaluation.areas_for_improvement,
        evaluation.sample_ideal_answer
      ]
    );

    res.json({
      success: true,
      message: 'Answer submitted and evaluated successfully.',
      answer_id: answerId,
      evaluation
    });
  } catch (error) {
    console.error('[Submit Answer Error]', error);
    res.status(500).json({ success: false, message: 'Failed to submit and evaluate answer.' });
  }
});

// Finalize & Complete Interview
router.post('/:id/complete', authenticateToken, async (req, res) => {
  try {
    const interviewId = parseInt(req.params.id, 10);

    const interviews = await query(
      `SELECT * FROM interviews WHERE id = ? AND user_id = ?`,
      [interviewId, req.user.id]
    );

    if (interviews.length === 0) {
      return res.status(404).json({ success: false, message: 'Interview session not found.' });
    }

    const scoreAggregates = await query(
      `SELECT 
          AVG(s.score) as avg_overall,
          AVG(s.technical_score) as avg_tech,
          AVG(s.communication_score) as avg_comm,
          AVG(s.problem_solving_score) as avg_ps
       FROM answers a
       JOIN scores s ON a.id = s.answer_id
       WHERE a.interview_id = ?`,
      [interviewId]
    );

    const agg = scoreAggregates[0] || {};
    const overallScore = parseFloat((agg.avg_overall || 0).toFixed(2));
    const techScore = parseFloat((agg.avg_tech || 0).toFixed(2));
    const commScore = parseFloat((agg.avg_comm || 0).toFixed(2));
    const psScore = parseFloat((agg.avg_ps || 0).toFixed(2));

    await query(
      `UPDATE interviews 
       SET overall_score = ?, technical_score = ?, communication_score = ?, problem_solving_score = ?, status = 'completed', completed_at = NOW()
       WHERE id = ?`,
      [overallScore, techScore, commScore, psScore, interviewId]
    );

    res.json({
      success: true,
      message: 'Interview completed successfully.',
      summary: {
        interview_id: interviewId,
        overall_score: overallScore,
        technical_score: techScore,
        communication_score: commScore,
        problem_solving_score: psScore,
        status: 'completed'
      }
    });
  } catch (error) {
    console.error('[Complete Interview Error]', error);
    res.status(500).json({ success: false, message: 'Failed to complete interview session.' });
  }
});

module.exports = router;
