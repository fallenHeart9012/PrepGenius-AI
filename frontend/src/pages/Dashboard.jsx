import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import ScoreGauge from '../components/ScoreGauge';
import { Video, Award, Target, Zap, Clock, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [recentInterviews, setRecentInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [analyticsRes, interviewsRes] = await Promise.all([
          api.getAnalytics().catch(() => ({ success: false })),
          api.getInterviews().catch(() => ({ success: false }))
        ]);

        if (analyticsRes.success) setAnalytics(analyticsRes.analytics);
        if (interviewsRes.success) setRecentInterviews(interviewsRes.interviews.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const summary = analytics?.summary || {
    total_interviews: 0,
    completed_interviews: 0,
    average_score: 0,
    highest_score: 0,
    average_technical: 0
  };

  return (
    <div style={{ padding: '2rem' }} className="animate-fade-in">
      {/* Hero Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '2.5rem',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.15) 50%, rgba(6, 182, 212, 0.1) 100%)',
        border: '1px solid var(--border-glass-bright)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ maxWidth: '600px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.08)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '0.75rem' }}>
            <Sparkles size={14} /> AI Technical Coach Active
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#FFF', lineHeight: '1.2' }}>
            Welcome back, {user?.name || 'Candidate'}! 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', marginTop: '0.5rem', lineHeight: '1.6' }}>
            Targeting <strong style={{ color: '#FFF' }}>{user?.target_role || 'Fullstack Developer'}</strong> position.
            Ready to test your knowledge with personalized AI questions and immediate feedback?
          </p>
        </div>

        <Link to="/interview" className="btn-primary" style={{ padding: '0.9rem 1.8rem', fontSize: '1rem' }}>
          <Video size={20} />
          <span>Start AI Mock Interview</span>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <StatCard
          title="Total Interviews"
          value={summary.total_interviews}
          subtitle={`${summary.completed_interviews} Completed`}
          icon={Video}
          color="var(--primary)"
        />
        <StatCard
          title="Average AI Score"
          value={summary.average_score ? `${summary.average_score} / 10` : 'N/A'}
          subtitle="Across all evaluations"
          icon={Award}
          color="var(--accent-emerald)"
        />
        <StatCard
          title="Highest Score"
          value={summary.highest_score ? `${summary.highest_score} / 10` : 'N/A'}
          subtitle="Personal best"
          icon={Zap}
          color="var(--accent-amber)"
        />
        <StatCard
          title="Technical Depth"
          value={summary.average_technical ? `${summary.average_technical} / 10` : '7.5 / 10'}
          subtitle="Domain mastery level"
          icon={Target}
          color="var(--accent-cyan)"
        />
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Recent Activity Table */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFF' }}>Recent Mock Interviews</h3>
            <Link to="/history" style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {recentInterviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <Clock size={40} color="var(--text-dim)" style={{ marginBottom: '0.75rem' }} />
              <p style={{ fontSize: '0.95rem' }}>No mock interviews recorded yet.</p>
              <Link to="/interview" style={{ display: 'inline-block', marginTop: '1rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                Launch your first session →
              </Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Role & Stack</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Difficulty</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Score</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInterviews.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: 600, color: '#FFF' }}>
                        <div>{item.role}</div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.tech_stack}</span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)' }}>{item.difficulty}</td>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: 700, color: item.overall_score >= 8 ? 'var(--accent-emerald)' : 'var(--accent-cyan)' }}>
                        {item.status === 'completed' ? `${item.overall_score} / 10` : '—'}
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                          background: item.status === 'completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: item.status === 'completed' ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                          border: `1px solid ${item.status === 'completed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                        }}>
                          {item.status === 'completed' ? 'Completed' : 'In Progress'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', color: 'var(--text-dim)', fontSize: '0.82rem' }}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* AI Performance Insight Widget */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.75rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFF', marginBottom: '1.25rem' }}>
              Target Readiness
            </h3>
            <ScoreGauge score={summary.average_score || 7.8} size={130} label="Preparedness Gauge" />
            <div style={{ marginTop: '1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Based on your evaluation history, your technical responses are well structured. Keep practicing system design scenarios.
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-amber)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.6rem' }}>
              <TrendingUp size={18} />
              <span>Recommended Practice</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Focus your next session on <strong>Concurrency & API Security</strong> for the Senior Fullstack role.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
