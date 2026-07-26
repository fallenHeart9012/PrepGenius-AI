const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  multipleStatements: true
};

let pool = null;
let isConnected = false;

// Fallback in-memory DB if MySQL connection fails (for standalone / preview mode)
const memoryDb = {
  users: [],
  interviews: [],
  questions: [],
  answers: [],
  scores: [],
  userNextId: 1,
  interviewNextId: 1,
  questionNextId: 1,
  answerNextId: 1,
  scoreNextId: 1
};

async function initDb() {
  try {
    // 1. Connection without DB name to ensure DB exists
    const tempConnection = await mysql.createConnection(dbConfig);
    const dbName = process.env.DB_NAME || 'ai_mock_interview';
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await tempConnection.end();

    // 2. Connect with pool to target database
    pool = mysql.createPool({
      ...dbConfig,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection
    const connection = await pool.getConnection();
    console.log(`[Database] Successfully connected to MySQL database '${dbName}'.`);
    connection.release();

    // Execute DDL schema
    const schemaPath = path.join(__dirname, '../db/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(schemaSql);
      console.log('[Database] Schema verified and initialized.');
    }

    isConnected = true;
  } catch (error) {
    console.warn('[Database Warning] MySQL connection failed. Error:', error.message);
    console.warn('[Database Warning] Falling back to In-Memory Database Mode for testing.');
    isConnected = false;
  }
}

async function query(sql, params = []) {
  if (isConnected && pool) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (err) {
      console.error('[DB Query Error]', err.message);
      throw err;
    }
  } else {
    // Basic mock handling for in-memory fallback
    return executeInMemoryQuery(sql, params);
  }
}

// In-Memory Helper for smooth execution when local MySQL is absent
function executeInMemoryQuery(sql, params) {
  const normalizedSql = sql.trim().toLowerCase();
  
  if (normalizedSql.startsWith('select * from users where email')) {
    const email = params[0];
    const user = memoryDb.users.find(u => u.email === email);
    return user ? [user] : [];
  }
  
  if (normalizedSql.startsWith('select * from users where id')) {
    const id = parseInt(params[0], 10);
    const user = memoryDb.users.find(u => u.id === id);
    return user ? [user] : [];
  }

  if (normalizedSql.startsWith('insert into users')) {
    const newUser = {
      id: memoryDb.userNextId++,
      name: params[0],
      email: params[1],
      password_hash: params[2],
      target_role: params[3] || 'Fullstack Developer',
      experience_level: params[4] || 'Mid Level',
      created_at: new Date()
    };
    memoryDb.users.push(newUser);
    return { insertId: newUser.id };
  }

  if (normalizedSql.startsWith('update users')) {
    // handle profile/password update
    const userId = parseInt(params[params.length - 1], 10);
    const user = memoryDb.users.find(u => u.id === userId);
    if (user) {
      if (normalizedSql.includes('password_hash')) {
        user.password_hash = params[0];
      } else {
        user.name = params[0];
        user.target_role = params[1];
        user.experience_level = params[2];
      }
    }
    return { affectedRows: user ? 1 : 0 };
  }

  if (normalizedSql.startsWith('insert into interviews')) {
    const interview = {
      id: memoryDb.interviewNextId++,
      user_id: params[0],
      role: params[1],
      difficulty: params[2],
      tech_stack: params[3],
      total_questions: params[4] || 5,
      status: 'in_progress',
      overall_score: 0,
      technical_score: 0,
      communication_score: 0,
      problem_solving_score: 0,
      created_at: new Date()
    };
    memoryDb.interviews.push(interview);
    return { insertId: interview.id };
  }

  if (normalizedSql.startsWith('insert into questions')) {
    const question = {
      id: memoryDb.questionNextId++,
      interview_id: params[0],
      question_order: params[1],
      question_text: params[2],
      category: params[3],
      hints: params[4] || '',
      created_at: new Date()
    };
    memoryDb.questions.push(question);
    return { insertId: question.id };
  }

  if (normalizedSql.startsWith('select * from interviews where user_id')) {
    const userId = parseInt(params[0], 10);
    return memoryDb.interviews
      .filter(i => i.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  if (normalizedSql.startsWith('select * from interviews where id')) {
    const id = parseInt(params[0], 10);
    const interview = memoryDb.interviews.find(i => i.id === id);
    return interview ? [interview] : [];
  }

  if (normalizedSql.startsWith('select * from questions where interview_id')) {
    const interviewId = parseInt(params[0], 10);
    return memoryDb.questions
      .filter(q => q.interview_id === interviewId)
      .sort((a, b) => a.question_order - b.question_order);
  }

  if (normalizedSql.startsWith('insert into answers')) {
    const answer = {
      id: memoryDb.answerNextId++,
      interview_id: params[0],
      question_id: params[1],
      user_answer: params[2],
      created_at: new Date()
    };
    memoryDb.answers.push(answer);
    return { insertId: answer.id };
  }

  if (normalizedSql.startsWith('insert into scores')) {
    const scoreObj = {
      id: memoryDb.scoreNextId++,
      answer_id: params[0],
      score: parseFloat(params[1]),
      technical_score: parseFloat(params[2]),
      communication_score: parseFloat(params[3]),
      problem_solving_score: parseFloat(params[4]),
      technical_feedback: params[5],
      communication_feedback: params[6],
      areas_for_improvement: params[7],
      sample_ideal_answer: params[8],
      created_at: new Date()
    };
    memoryDb.scores.push(scoreObj);
    return { insertId: scoreObj.id };
  }

  if (normalizedSql.startsWith('update interviews')) {
    const id = parseInt(params[4], 10);
    const interview = memoryDb.interviews.find(i => i.id === id);
    if (interview) {
      interview.overall_score = parseFloat(params[0]);
      interview.technical_score = parseFloat(params[1]);
      interview.communication_score = parseFloat(params[2]);
      interview.problem_solving_score = parseFloat(params[3]);
      interview.status = 'completed';
      interview.completed_at = new Date();
    }
    return { affectedRows: interview ? 1 : 0 };
  }

  return [];
}

module.exports = {
  initDb,
  query,
  isDbConnected: () => isConnected,
  getMemoryDb: () => memoryDb
};
