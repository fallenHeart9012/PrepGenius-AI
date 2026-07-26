import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, User, LogOut, Bot } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{
      height: '70px',
      borderBottom: '1px solid var(--border-glass)',
      background: 'rgba(11, 15, 23, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem'
    }}>
      {/* Brand Logo */}
      <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
        }}>
          <Bot size={22} color="#FFF" />
        </div>
        <div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF', letterSpacing: '-0.5px' }}>
            PrepGenius<span className="gradient-text"> AI</span>
          </span>
          <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--accent-cyan)', fontWeight: 600, marginTop: '-3px' }}>
            MOCK INTERVIEW PLATFORM
          </span>
        </div>
      </Link>

      {/* User Actions */}
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '0.4rem 0.9rem',
            borderRadius: '20px',
            border: '1px solid var(--border-glass)'
          }}>
            <Sparkles size={16} color="var(--accent-amber)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Role: <strong style={{ color: '#FFF' }}>{user.target_role || 'Fullstack'}</strong>
            </span>
          </div>

          <Link to="/profile" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-main)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--primary) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              fontWeight: 700
            }}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span>{user.name}</span>
          </Link>

          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-rose)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </header>
  );
}
