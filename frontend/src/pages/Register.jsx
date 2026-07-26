import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bot, ArrowRight, User, Mail, Lock, Briefcase, AlertCircle } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetRole, setTargetRole] = useState('Fullstack Developer');
  const [experienceLevel, setExperienceLevel] = useState('Mid Level');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await register(name, email, password, targetRole, experienceLevel);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
            marginBottom: '1rem'
          }}>
            <Bot size={30} color="#FFF" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF' }}>Create Account</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Start mastering technical interviews with AI coaching
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
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '40px', width: '100%' }}
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '40px', width: '100%' }}
                placeholder="developer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '40px', width: '100%' }}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Target Role</label>
              <select
                className="form-select"
                style={{ width: '100%' }}
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              >
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Fullstack Developer">Fullstack Developer</option>
                <option value="DevOps / SRE">DevOps / SRE</option>
                <option value="Data Engineer">Data Engineer</option>
                <option value="AI / ML Engineer">AI / ML Engineer</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Experience Level</label>
              <select
                className="form-select"
                style={{ width: '100%' }}
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
              >
                <option value="Junior / Entry">Junior / Entry</option>
                <option value="Mid Level">Mid Level</option>
                <option value="Senior Level">Senior Level</option>
                <option value="Lead / Staff">Lead / Staff</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
            style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '0.85rem' }}
          >
            <span>{isSubmitting ? 'Creating Account...' : 'Get Started'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-cyan)', fontWeight: 600, textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
