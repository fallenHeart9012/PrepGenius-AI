import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, Lock, Key, Save, CheckCircle, AlertCircle, Shield } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [targetRole, setTargetRole] = useState(user?.target_role || 'Fullstack Developer');
  const [experienceLevel, setExperienceLevel] = useState(user?.experience_level || 'Mid Level');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });
  
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setTargetRole(user.target_role || 'Fullstack Developer');
      setExperienceLevel(user.experience_level || 'Mid Level');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ text: '', type: '' });
    setIsUpdatingProfile(true);

    try {
      const res = await api.updateProfile({
        name,
        target_role: targetRole,
        experience_level: experienceLevel
      });

      if (res.success && res.user) {
        updateUser(res.user);
        setProfileMsg({ text: 'Profile updated successfully!', type: 'success' });
      }
    } catch (err) {
      setProfileMsg({ text: err.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ text: '', type: '' });
    setIsUpdatingPassword(true);

    try {
      const res = await api.updatePassword({
        currentPassword,
        newPassword
      });

      if (res.success) {
        setPasswordMsg({ text: 'Password changed successfully!', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      setPasswordMsg({ text: err.message || 'Failed to change password.', type: 'error' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }} className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>Account Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Manage your personal profile, interview target preferences, and security settings
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Profile Settings Form */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.5rem' }}>
            <User size={20} />
            <span style={{ color: '#FFF' }}>Profile Information</span>
          </div>

          {profileMsg.text && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
              background: profileMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              color: profileMsg.type === 'success' ? 'var(--accent-emerald)' : 'var(--accent-rose)',
              border: `1px solid ${profileMsg.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
            }}>
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.6 }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Role</label>
              <select
                className="form-select"
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
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
              >
                <option value="Junior / Entry">Junior / Entry</option>
                <option value="Mid Level">Mid Level</option>
                <option value="Senior Level">Senior Level</option>
                <option value="Lead / Staff">Lead / Staff</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isUpdatingProfile}
              style={{ marginTop: '1rem' }}
            >
              <Save size={18} />
              <span>{isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* Security & API Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Change Password Panel */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-rose)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              <Lock size={20} />
              <span style={{ color: '#FFF' }}>Security Settings</span>
            </div>

            {passwordMsg.text && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
                background: passwordMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                color: passwordMsg.type === 'success' ? 'var(--accent-emerald)' : 'var(--accent-rose)'
              }}>
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                className="btn-secondary"
                disabled={isUpdatingPassword}
                style={{ marginTop: '0.5rem' }}
              >
                <span>{isUpdatingPassword ? 'Updating...' : 'Update Password'}</span>
              </button>
            </form>
          </div>

          {/* AI Engine Status */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.75rem' }}>
              <Key size={18} />
              <span>AI Evaluation Engine Status</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Connected to <strong>Google Gemini 2.5 Flash API</strong>. Question generation and real-time answer scoring are active.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
