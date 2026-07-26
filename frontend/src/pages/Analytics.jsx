import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, RadialLinearScale, BarElement } from 'chart.js';
import { Line, Radar, Bar } from 'react-chartjs-2';
import { BarChart3, TrendingUp, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await api.getAnalytics();
        if (res.success) {
          setAnalytics(res.analytics);
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  const trends = analytics?.score_trends || [
    { date: 'Session 1', score: 6.5 },
    { date: 'Session 2', score: 7.2 },
    { date: 'Session 3', score: 8.0 },
    { date: 'Session 4', score: 8.5 }
  ];

  const radarSkills = analytics?.skill_radar || [
    { skill: 'Technical Depth', score: 8.0 },
    { skill: 'Communication', score: 7.5 },
    { skill: 'Problem Solving', score: 8.5 },
    { skill: 'System Design', score: 7.0 },
    { skill: 'Code Cleanliness', score: 8.2 }
  ];

  // Chart Data Configurations
  const lineData = {
    labels: trends.map(t => t.date),
    datasets: [
      {
        label: 'Overall Performance Score',
        data: trends.map(t => t.score),
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#9CA3AF' } }
    },
    scales: {
      x: { ticks: { color: '#9CA3AF' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { min: 0, max: 10, ticks: { color: '#9CA3AF' }, grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };

  const radarData = {
    labels: radarSkills.map(s => s.skill),
    datasets: [
      {
        label: 'Skill Proficiency Rating',
        data: radarSkills.map(s => s.score),
        backgroundColor: 'rgba(6, 182, 212, 0.25)',
        borderColor: '#06B6D4',
        borderWidth: 2,
        pointBackgroundColor: '#06B6D4'
      }
    ]
  };

  const radarOptions = {
    responsive: true,
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        pointLabels: { color: '#F9FAFB', font: { size: 12, weight: '600' } },
        ticks: { color: '#9CA3AF', backdropColor: 'transparent' },
        min: 0,
        max: 10
      }
    },
    plugins: {
      legend: { labels: { color: '#9CA3AF' } }
    }
  };

  return (
    <div style={{ padding: '2rem' }} className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>Performance Analytics</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Deep-dive technical assessment analytics and historical skill progress
        </p>
      </div>

      {/* Top Grid Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Line Chart */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '1.25rem' }}>
            <TrendingUp size={20} />
            <span style={{ fontSize: '1.1rem', color: '#FFF' }}>Score Progress Timeline</span>
          </div>
          <Line data={lineData} options={lineOptions} />
        </div>

        {/* Radar Chart */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '1.25rem' }}>
            <ShieldCheck size={20} />
            <span style={{ fontSize: '1.1rem', color: '#FFF' }}>Competency Radar</span>
          </div>
          <Radar data={radarData} options={radarOptions} />
        </div>
      </div>

      {/* AI Actionable Insights Banner */}
      <div className="glass-panel" style={{ padding: '2rem', borderLeft: '4px solid var(--accent-amber)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--accent-amber)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem' }}>
          <Zap size={22} />
          <span>AI Performance Diagnosis</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
          Your <strong>Technical Accuracy</strong> score is consistently high (8.0+). To increase your overall score to Senior level (9.0+), focus on articulating explicit <strong>time/space complexity trade-offs</strong> early in your response during System Design questions.
        </p>
      </div>
    </div>
  );
}
