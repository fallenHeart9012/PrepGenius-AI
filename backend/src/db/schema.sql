-- AI Mock Interview Platform Database Schema
CREATE DATABASE IF NOT EXISTS ai_mock_interview;
USE ai_mock_interview;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    target_role VARCHAR(100) DEFAULT 'Fullstack Developer',
    experience_level VARCHAR(50) DEFAULT 'Mid Level',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Interviews Table
CREATE TABLE IF NOT EXISTS interviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    role VARCHAR(100) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    tech_stack VARCHAR(255) NOT NULL,
    total_questions INT DEFAULT 5,
    status ENUM('in_progress', 'completed') DEFAULT 'in_progress',
    overall_score DECIMAL(4, 2) DEFAULT 0.00,
    technical_score DECIMAL(4, 2) DEFAULT 0.00,
    communication_score DECIMAL(4, 2) DEFAULT 0.00,
    problem_solving_score DECIMAL(4, 2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    interview_id INT NOT NULL,
    question_order INT NOT NULL,
    question_text TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    hints TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Answers Table
CREATE TABLE IF NOT EXISTS answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    interview_id INT NOT NULL,
    question_id INT NOT NULL,
    user_answer TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Scores Table
CREATE TABLE IF NOT EXISTS scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    answer_id INT NOT NULL UNIQUE,
    score DECIMAL(4,2) NOT NULL,
    technical_score DECIMAL(4,2) NOT NULL,
    communication_score DECIMAL(4,2) NOT NULL,
    problem_solving_score DECIMAL(4,2) NOT NULL,
    technical_feedback TEXT NOT NULL,
    communication_feedback TEXT NOT NULL,
    areas_for_improvement TEXT NOT NULL,
    sample_ideal_answer TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (answer_id) REFERENCES answers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
