import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'var(--primary)' }) {
  return (
    <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </span>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF', margin: '0.2rem 0' }}>
          {value}
        </div>
        {subtitle && (
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            {subtitle}
          </span>
        )}
      </div>

      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '14px',
        background: `rgba(${hexToRgb(color)}, 0.12)`,
        border: `1px solid rgba(${hexToRgb(color)}, 0.3)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {Icon && <Icon size={24} color={color} />}
      </div>
    </div>
  );
}

function hexToRgb(colorStr) {
  if (colorStr.startsWith('var(')) {
    return '99, 102, 241';
  }
  let hex = colorStr.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const num = parseInt(hex, 16);
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}
