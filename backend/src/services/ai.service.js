const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

let aiClient = null;
const apiKey = process.env.GEMINI_API_KEY;
if (apiKey && apiKey.trim().length > 0) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('[AI Service Warning] Failed to initialize Gemini AI client:', err.message);
  }
}

/**
 * Generate technical interview questions tailored to role, difficulty, tech stack & candidate resume
 */
async function generateQuestions({ role, difficulty, techStack, count = 5, resumeText = '' }) {
  let resumePromptSegment = '';
  if (resumeText && resumeText.trim().length > 0) {
    resumePromptSegment = `\nCandidate Resume Highlights:\n"${resumeText.trim().substring(0, 1500)}"\nTailor at least 2 questions to specifically challenge experience and projects listed in the candidate's resume.`;
  }

  const prompt = `You are a Senior Technical Interviewer conducting a mock interview.
Generate ${count} high-quality, realistic technical interview questions for a ${difficulty} level candidate applying for a ${role} position with expertise in ${techStack}.${resumePromptSegment}

Return ONLY a valid JSON array of objects with no extra formatting, markdown backticks, or text before/after. Each object must strictly follow this JSON schema:
[
  {
    "order": 1,
    "text": "The exact question text",
    "category": "Domain category (e.g. System Design, Coding, Concepts, Behavioral)",
    "hints": "Key points candidate should cover"
  }
]`;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const rawText = response.text || '';
      const cleanedJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsedQuestions = JSON.parse(cleanedJson);

      if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
        return parsedQuestions.map((q, idx) => ({
          order: idx + 1,
          text: q.text || `Explain core concepts of ${techStack} in the context of ${role}.`,
          category: q.category || (idx % 2 === 0 ? 'Coding & Algorithm' : 'System Design'),
          hints: q.hints || 'Discuss architectural principles, best practices, and time complexity.'
        }));
      }
    } catch (error) {
      console.warn('[AI Service Warning] Gemini question generation fallback:', error.message);
    }
  }

  return generateFallbackQuestions(role, difficulty, techStack, count);
}

/**
 * Evaluate user's answer and produce structured numerical feedback & scores
 */
async function evaluateAnswer({ questionText, category, userAnswer, role, difficulty }) {
  const prompt = `You are an expert AI interviewer grading a candidate's answer.
Candidate Role: ${role} (${difficulty} Level)
Question (${category}): "${questionText}"
Candidate's Answer: "${userAnswer}"

Evaluate the answer objectively on a scale of 1.0 to 10.0 for:
1. overall_score (Weighted average)
2. technical_score (Accuracy, depth, domain knowledge)
3. communication_score (Clarity, structure, articulation)
4. problem_solving_score (Critical thinking, trade-offs, practical application)

Provide constructive feedback and a clear, ideal sample answer.

Return ONLY a valid JSON object with NO markdown tags or introductory text:
{
  "score": 8.5,
  "technical_score": 8.5,
  "communication_score": 8.0,
  "problem_solving_score": 9.0,
  "technical_feedback": "Detailed evaluation of technical accuracy...",
  "communication_feedback": "Evaluation of clarity and expression...",
  "areas_for_improvement": "Actionable tips to enhance answer...",
  "sample_ideal_answer": "A comprehensive example of how to answer this question perfectly."
}`;

  if (aiClient && userAnswer && userAnswer.trim().length > 0) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const rawText = response.text || '';
      const cleanedJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const evaluation = JSON.parse(cleanedJson);

      return {
        score: clampScore(evaluation.score || 7.5),
        technical_score: clampScore(evaluation.technical_score || 7.5),
        communication_score: clampScore(evaluation.communication_score || 7.5),
        problem_solving_score: clampScore(evaluation.problem_solving_score || 7.5),
        technical_feedback: evaluation.technical_feedback || 'Solid technical comprehension demonstrated.',
        communication_feedback: evaluation.communication_feedback || 'Clear explanation with good structure.',
        areas_for_improvement: evaluation.areas_for_improvement || 'Consider providing more concrete real-world code or architecture examples.',
        sample_ideal_answer: evaluation.sample_ideal_answer || 'A complete solution addresses edge cases, performance considerations, and clean code principles.'
      };
    } catch (error) {
      console.warn('[AI Service Warning] Gemini answer evaluation fallback:', error.message);
    }
  }

  return evaluateFallbackHeuristic(questionText, userAnswer);
}

function clampScore(val) {
  const num = parseFloat(val);
  if (isNaN(num)) return 7.0;
  return Math.min(10.0, Math.max(1.0, parseFloat(num.toFixed(1))));
}

function generateFallbackQuestions(role, difficulty, techStack, count) {
  const basePool = [
    {
      text: `How do you handle state management, performance optimization, and modular component design in a scalable ${techStack || 'web'} application?`,
      category: 'Architecture & State Management',
      hints: 'Discuss immutability, reactivity, memoization, and component hierarchy.'
    },
    {
      text: `Explain how you design RESTful or GraphQL APIs for high availability, security, and low latency when building for a ${role} role.`,
      category: 'API & Backend Design',
      hints: 'Cover authentication (JWT), rate limiting, caching, and database indexing.'
    },
    {
      text: `Walk me through a time you debugged a critical performance bottleneck or memory leak in production. What tools and methodology did you use?`,
      category: 'Debugging & Performance',
      hints: 'Detail profiling tools, metric tracking, root cause identification, and resolution.'
    },
    {
      text: `How do you ensure data integrity, database concurrency, and transaction safety when handling complex multi-step user workflows?`,
      category: 'Database & Transactions',
      hints: 'Reference ACID properties, optimistic/pessimistic locking, and indexing strategies.'
    },
    {
      text: `How do you approach continuous integration, automated testing, and zero-downtime deployment strategies for modern applications?`,
      category: 'DevOps & Testing',
      hints: 'Mention Docker, CI/CD pipelines, unit/integration testing, and blue-green deployments.'
    }
  ];

  return basePool.slice(0, count).map((q, idx) => ({
    order: idx + 1,
    text: q.text,
    category: q.category,
    hints: q.hints
  }));
}

function evaluateFallbackHeuristic(questionText, userAnswer) {
  const answerLength = userAnswer ? userAnswer.trim().length : 0;
  
  if (answerLength < 10) {
    return {
      score: 3.0,
      technical_score: 3.0,
      communication_score: 2.5,
      problem_solving_score: 3.5,
      technical_feedback: 'The response was too brief to evaluate technical depth.',
      communication_feedback: 'Please provide a more elaborate and structured response.',
      areas_for_improvement: 'Elaborate on core mechanisms, terminology, and practical use-cases.',
      sample_ideal_answer: 'A comprehensive answer explains the underlying principles, trade-offs, and provides step-by-step logic.'
    };
  }

  const keywords = ['performance', 'state', 'cache', 'database', 'security', 'async', 'api', 'architecture', 'scalability', 'index', 'test'];
  const matched = keywords.filter(k => userAnswer.toLowerCase().includes(k)).length;
  
  let baseScore = 6.5 + Math.min(answerLength / 120, 2.0) + Math.min(matched * 0.3, 1.5);
  baseScore = clampScore(baseScore);

  return {
    score: baseScore,
    technical_score: clampScore(baseScore + 0.2),
    communication_score: clampScore(baseScore - 0.1),
    problem_solving_score: clampScore(baseScore),
    technical_feedback: 'Good coverage of core concepts. Shows solid understanding of key software engineering patterns.',
    communication_feedback: 'Well-formulated answer. Clearly articulated the logic behind your approach.',
    areas_for_improvement: 'To achieve a perfect 10, include quantitative performance metrics and specific edge case considerations.',
    sample_ideal_answer: 'An exemplary answer outlines the architecture, explains key trade-offs, details testing strategies, and demonstrates production readiness.'
  };
}

module.exports = {
  generateQuestions,
  evaluateAnswer
};
