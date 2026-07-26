import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Video, History, BarChart3, User, Sparkles } from 'lucide-react';

export default function Sidebar() {
  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/interview', label: 'Mock Interview', icon: Video, badge: 'AI Live' },
    { to: '/history', label: 'Interview History', icon: History },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/profile', label: 'Profile', icon: User }
  ];

  return (
    <aside style={{
      width: '250px',
      minHeight: 'calc(100vh - 70px)',
      borderRight: '1px solid var(--border-glass)',
      background: 'rgba(11, 15, 23, 0.6)',
      backdropFilter: 'blur(10px)',
      padding: '1.5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 0.75rem 0.5rem 0.75rem' }}>
          Navigation
        </div>

        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                textDecoration: 'none',
                color: isActive ? '#FFF' : 'var(--text-muted)',
                background: isActive ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.15) 100%)' : 'transparent',
                border: isActive ? '1px solid var(--border-glass-bright)' : '1px solid transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.92rem',
                transition: 'all 0.2s ease'
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Icon size={18} color="var(--primary)" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, var(--accent-rose), var(--secondary))',
                  color: '#FFF',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '12px'
                }}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* AI Assistant Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
        border: '1px solid var(--border-glass-bright)',
        borderRadius: '12px',
        padding: '1rem',
        marginTop: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <Sparkles size={16} color="var(--accent-cyan)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF' }}>AI Coach Ready</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          Practice real-time technical questions & receive instant AI feedback on code depth and articulation.
        </p>
      </div>
    </aside>
  );
}
