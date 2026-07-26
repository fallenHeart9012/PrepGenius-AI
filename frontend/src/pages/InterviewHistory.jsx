import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { History, Eye, X, Award, CheckCircle, Clock, Search, Sparkles } from 'lucide-react';

export default function InterviewHistory() {
  const [interviews, setInterviews] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      const res = await api.getInterviews();
      if (res.success) {
        setInterviews(res.interviews);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenDetails = async (id) => {
    try {
      const res = await api.getInterviewDetails(id);
      if (res.success) {
        setSelectedInterview(res.interview);
      }
    } catch (err) {
      alert('Failed to load interview details.');
    }
  };

  const filteredInterviews = interviews.filter(item => {
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus.toLowerCase();
    const matchesSearch = item.role.toLowerCase().includes(searchQuery.toLowerCase()) || item.tech_stack.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ padding: '2rem' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>Interview History</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Review past mock interview sessions, questions, and AI evaluations
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '10px' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px', width: '220px', padding: '0.5rem 0.75rem 0.5rem 36px', fontSize: '0.85rem' }}
              placeholder="Search by role or stack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="IN_PROGRESS">In Progress</option>
          </select>
        </div>
      </div>

      {/* History Grid */}
      {filteredInterviews.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <History size={48} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#FFF', fontWeight: 700 }}>No Interview History Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Start a new mock session to record your questions and scores.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredInterviews.map((item) => (
            <div key={item.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    background: item.status === 'completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: item.status === 'completed' ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                    border: `1px solid ${item.status === 'completed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                  }}>
                    {item.status === 'completed' ? 'Completed' : 'In Progress'}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF', marginBottom: '0.25rem' }}>
                  {item.role}
                </h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  {item.difficulty} • {item.tech_stack}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Overall Score</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: item.overall_score >= 8 ? 'var(--accent-emerald)' : 'var(--accent-cyan)' }}>
                    {item.status === 'completed' ? `${item.overall_score} / 10` : 'Pending'}
                  </div>
                </div>

                <button
                  className="btn-secondary"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
                  onClick={() => handleOpenDetails(item.id)}
                >
                  <Eye size={15} />
                  <span>Review Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAIL MODAL DRILL DOWN */}
      {selectedInterview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(10px)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div className="glass-panel animate-fade-in" style={{
            width: '100%',
            maxWidth: '850px',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '2.5rem',
            position: 'relative'
          }}>
            <button
              onClick={() => setSelectedInterview(null)}
              style={{
                position: 'absolute',
                right: '1.5rem',
                top: '1.5rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <X size={24} />
            </button>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFF' }}>
              {selectedInterview.role} Details
            </h2>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              {selectedInterview.difficulty} Level | Tech Stack: {selectedInterview.tech_stack}
            </div>

            {/* Questions & Evaluations List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {selectedInterview.questions.map((q, idx) => (
                <div key={q.id} style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      Question {idx + 1}: {q.category}
                    </span>
                    {q.answer?.score && (
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                        Score: {q.answer.score.score} / 10
                      </span>
                    )}
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#FFF', marginBottom: '0.75rem' }}>
                    {q.question_text}
                  </h4>

                  <div style={{ marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>User Response:</span>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginTop: '0.2rem', background: 'rgba(0,0,0,0.3)', padding: '0.6rem', borderRadius: '6px' }}>
                      {q.answer?.user_answer || 'No answer submitted.'}
                    </p>
                  </div>

                  {q.answer?.score && (
                    <div style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass-bright)', fontSize: '0.85rem' }}>
                      <strong style={{ color: 'var(--primary)' }}>AI Feedback:</strong>
                      <p style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>{q.answer.score.technical_feedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
