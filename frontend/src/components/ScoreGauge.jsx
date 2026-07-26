import React from 'react';

export default function ScoreGauge({ score = 0, size = 120, label = "Overall Score" }) {
  const numScore = parseFloat(score || 0);
  const normalized = Math.min(10, Math.max(0, numScore));
  const percentage = (normalized / 10) * 100;
  
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let scoreColor = 'var(--accent-rose)';
  if (numScore >= 8.0) scoreColor = 'var(--accent-emerald)';
  else if (numScore >= 6.5) scoreColor = 'var(--accent-cyan)';
  else if (numScore >= 5.0) scoreColor = 'var(--accent-amber)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={scoreColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: `${size * 0.24}px`, fontWeight: 800, color: '#FFF' }}>
            {numScore.toFixed(1)}
          </span>
          <span style={{ fontSize: `${size * 0.1}px`, color: 'var(--text-muted)', fontWeight: 600 }}>/ 10</span>
        </div>
      </div>
      {label && <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.5rem' }}>{label}</span>}
    </div>
  );
}
