import React from 'react';

export default function Navigation({ currentIndex, totalProjects }) {
  const currentFormatted = String(currentIndex + 1).padStart(2, '0');
  const totalFormatted = String(totalProjects).padStart(2, '0');
  const progressRatio = totalProjects > 1 ? currentIndex / (totalProjects - 1) : 0;

  return (
    <nav 
      aria-label="Presentation Navigation"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
        paddingTop: 'max(24px, env(safe-area-inset-top))',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
        paddingLeft: 'max(28px, env(safe-area-inset-left))',
        paddingRight: 'max(28px, env(safe-area-inset-right))'
      }}
    >
      {/* Top Bar: Minimal Studio Branding */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%'
        }}
      >
        <span 
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'var(--text-main)',
            opacity: 0.9
          }}
        >
          OBJ
        </span>

        {/* 01 / 09 Counter */}
        <div 
          className="font-counter"
          style={{
            fontVariantNumeric: 'tabular-nums',
            color: 'var(--text-muted)'
          }}
        >
          <span>{currentFormatted}</span>
          <span style={{ opacity: 0.35, margin: '0 6px' }}>/</span>
          <span style={{ opacity: 0.4 }}>{totalFormatted}</span>
        </div>
      </div>

      {/* Thin Vertical Progress Indicator on Right Edge */}
      <div 
        style={{
          position: 'fixed',
          right: 'clamp(16px, 3vw, 32px)',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '2px',
          height: '140px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '1px',
          overflow: 'hidden',
          pointerEvents: 'none'
        }}
      >
        <div 
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            transformOrigin: 'top',
            transform: `scaleY(${progressRatio})`,
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'transform'
          }}
        />
      </div>
    </nav>
  );
}
