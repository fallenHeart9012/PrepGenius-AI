import React, { useState } from 'react';
import { api } from '../services/api';
import QuestionCard from '../components/QuestionCard';
import ScoreGauge from '../components/ScoreGauge';
import { Video, Sparkles, Play, Award, CheckCircle2, ChevronRight, RefreshCw, AlertCircle, FileText, Printer } from 'lucide-react';

export default function MockInterview() {
  const [session, setSession] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [evaluations, setEvaluations] = useState({});
  
  // Form State
  const [role, setRole] = useState('Fullstack Developer');
  const [difficulty, setDifficulty] = useState('Senior Level');
  const [techStack, setTechStack] = useState('React, Node.js, TypeScript, PostgreSQL');
  const [totalQuestions, setTotalQuestions] = useState(3);
  const [resumeText, setResumeText] = useState('');
  const [showResumeInput, setShowResumeInput] = useState(false);
  
  const [isInitializing, setIsInitializing] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  const handleStartInterview = async (e) => {
    e.preventDefault();
    setError('');
    setIsInitializing(true);

    try {
      const res = await api.startInterview({
        role,
        difficulty,
        tech_stack: techStack,
        total_questions: totalQuestions,
        resume_text: resumeText
      });

      if (res.success && res.interview) {
        setSession(res.interview);
        setCurrentQIndex(0);
        setEvaluations({});
        setSummary(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to start interview session.');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSubmitAnswer = async (questionId, userAnswer) => {
    if (!session) return;
    setIsSubmittingAnswer(true);

    try {
      const res = await api.submitAnswer(session.id, {
        question_id: questionId,
        user_answer: userAnswer
      });

      if (res.success && res.evaluation) {
        setEvaluations(prev => ({
          ...prev,
          [questionId]: {
            user_answer: userAnswer,
            evaluation: res.evaluation
          }
        }));
      }
    } catch (err) {
      alert(err.message || 'Failed to submit answer.');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleCompleteInterview = async () => {
    if (!session) return;
    setIsCompleting(true);

    try {
      const res = await api.completeInterview(session.id);
      if (res.success && res.summary) {
        setSummary(res.summary);
      }
    } catch (err) {
      alert(err.message || 'Failed to finalize interview.');
    } finally {
      setIsCompleting(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  const currentQuestion = session?.questions?.[currentQIndex];
  const currentEval = currentQuestion ? evaluations[currentQuestion.id] : null;

  return (
    <div style={{ padding: '2rem' }} className="animate-fade-in">
      {/* 1. SETUP FORM STATE */}
      {!session && (
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
                marginBottom: '1rem'
              }}>
                <Video size={32} color="#FFF" />
              </div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>Launch AI Mock Interview</h1>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Tailor questions to your target role, stack, or paste your resume for personalized AI probing.
              </p>
            </div>

            {error && (
              <div style={{
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                color: 'var(--accent-rose)',
                fontSize: '0.85rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleStartInterview}>
              <div className="form-group">
                <label className="form-label">Job Role / Position</label>
                <input
                  type="text"
                  className="form-input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Developer"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Difficulty Level</label>
                  <select
                    className="form-select"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option value="Junior Level">Junior Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                    <option value="Lead / Principal">Lead / Principal</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Number of Questions</label>
                  <select
                    className="form-select"
                    value={totalQuestions}
                    onChange={(e) => setTotalQuestions(parseInt(e.target.value, 10))}
                  >
                    <option value={3}>3 Questions (Quick Sprint)</option>
                    <option value={5}>5 Questions (Standard)</option>
                    <option value={8}>8 Questions (Deep Dive)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Primary Tech Stack & Topics</label>
                <input
                  type="text"
                  className="form-input"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  placeholder="e.g. React, Node.js, System Design, SQL"
                  required
                />
              </div>

              {/* Resume Text Tailoring Toggle */}
              <div style={{ marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setShowResumeInput(!showResumeInput)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent-cyan)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: 0
                  }}
                >
                  <FileText size={16} />
                  <span>{showResumeInput ? '− Hide Resume Tailoring' : '+ Paste Resume to Tailor Questions (AI Resume Analysis)'}</span>
                </button>

                {showResumeInput && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <label className="form-label">Paste Your Resume Highlights / Summary</label>
                    <textarea
                      className="form-textarea"
                      rows={4}
                      placeholder="Paste your past project accomplishments, work experience, or key technical bullet points..."
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={isInitializing}
                style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '1rem', marginTop: '1rem' }}
              >
                {isInitializing ? (
                  <>
                    <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>AI Generating Custom Questions...</span>
                  </>
                ) : (
                  <>
                    <Play size={20} />
                    <span>Begin Interview Session</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. LIVE INTERVIEW SESSION STATE */}
      {session && !summary && (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="glass-panel" style={{ padding: '1.25rem 1.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Session</span>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF' }}>{session.role} ({session.difficulty})</h2>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {session.questions.map((q, idx) => {
                const isDone = !!evaluations[q.id];
                const isCurrent = idx === currentQIndex;

                let bg = 'rgba(255, 255, 255, 0.08)';
                let color = 'var(--text-muted)';
                if (isDone) {
                  bg = 'rgba(16, 185, 129, 0.2)';
                  color = 'var(--accent-emerald)';
                } else if (isCurrent) {
                  bg = 'var(--primary)';
                  color = '#FFF';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQIndex(idx)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: bg,
                      color: color,
                      border: 'none',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              currentIndex={currentQIndex}
              totalQuestions={session.questions.length}
              onSubmitAnswer={handleSubmitAnswer}
              isSubmitting={isSubmittingAnswer}
              answered={currentEval}
            />
          )}

          {currentEval && (
            <div className="glass-panel animate-fade-in" style={{ padding: '2rem', marginTop: '1.5rem', borderColor: 'var(--border-glass-bright)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>
                <Sparkles size={20} />
                <span>Gemini AI Evaluation Report</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '1rem', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Overall Score</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{currentEval.evaluation.score} / 10</div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '1rem', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Technical Depth</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF' }}>{currentEval.evaluation.technical_score} / 10</div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '1rem', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Communication</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF' }}>{currentEval.evaluation.communication_score} / 10</div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '1rem', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Problem Solving</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF' }}>{currentEval.evaluation.problem_solving_score} / 10</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
                <div>
                  <strong style={{ color: 'var(--accent-emerald)' }}>Technical Assessment:</strong>
                  <p style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>{currentEval.evaluation.technical_feedback}</p>
                </div>
                <div>
                  <strong style={{ color: 'var(--accent-amber)' }}>Key Areas for Improvement:</strong>
                  <p style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>{currentEval.evaluation.areas_for_improvement}</p>
                </div>
                <div style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-glass-bright)' }}>
                  <strong style={{ color: 'var(--primary)' }}>Sample Model Answer:</strong>
                  <p style={{ color: 'var(--text-main)', marginTop: '0.3rem', fontFamily: 'var(--font-code)', fontSize: '0.85rem' }}>
                    {currentEval.evaluation.sample_ideal_answer}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                {currentQIndex < session.questions.length - 1 ? (
                  <button className="btn-primary" onClick={() => setCurrentQIndex(currentQIndex + 1)}>
                    <span>Next Question</span>
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <button className="btn-primary" style={{ background: 'linear-gradient(135deg, var(--accent-emerald), var(--primary))' }} onClick={handleCompleteInterview} disabled={isCompleting}>
                    <CheckCircle2 size={18} />
                    <span>{isCompleting ? 'Finalizing...' : 'Complete Interview & View Score'}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. FINAL SUMMARY STATE & PDF PRINT REPORT */}
      {summary && (
        <div style={{ maxWidth: '650px', margin: '0 auto' }}>
          <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid var(--accent-emerald)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-emerald)',
              marginBottom: '1rem'
            }}>
              <Award size={36} />
            </div>

            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>Interview Completed!</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.3rem' }}>
              Your aggregate performance evaluation has been generated.
            </p>

            <div style={{ margin: '2rem 0' }}>
              <ScoreGauge score={summary.overall_score} size={150} label="Final Performance Score" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Technical</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFF' }}>{summary.technical_score}</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Communication</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFF' }}>{summary.communication_score}</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Problem Solving</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFF' }}>{summary.problem_solving_score}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button
                className="btn-secondary"
                onClick={handlePrintReport}
              >
                <Printer size={18} />
                <span>Export PDF / Print Report</span>
              </button>

              <button
                className="btn-primary"
                onClick={() => { setSession(null); setSummary(null); }}
              >
                <RefreshCw size={18} />
                <span>Start Another Mock Session</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
