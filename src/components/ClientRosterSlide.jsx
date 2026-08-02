import React from 'react';
import { motion } from 'framer-motion';

export default function ClientRosterSlide({ isActive }) {
  const clients = [
    "Marwan Pablo",
    "Hassan El Shafei",
    "Amr Diab",
    "Tamer Hosny",
    "Mohamed Hamaki",
    "Ragheb Alama",
    "Nicole Saba",
    "TotalEnergies"
  ];

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#050505',
        overflow: 'hidden',
        paddingTop: 'clamp(52px, 8vh, 80px)',
        paddingBottom: 'clamp(60px, 10vh, 90px)',
        paddingLeft: 'clamp(20px, 5vw, 60px)',
        paddingRight: 'clamp(20px, 5vw, 60px)',
        userSelect: 'none'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '840px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '24px'
        }}
      >
        {/* Header Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="font-category" style={{ letterSpacing: '0.22em' }}>
            OTHER CLIENTS INCLUDE
          </span>
        </div>

        {/* Client Roster Grid / Pills */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px 16px',
            marginTop: '8px',
            maxWidth: '100%'
          }}
        >
          {clients.map((client, idx) => (
            <motion.div
              key={client}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: isActive ? 1 : 0.4, y: isActive ? 0 : 10 }}
              transition={{ delay: idx * 0.05 + 0.1, duration: 0.5 }}
              style={{
                padding: '12px 20px',
                borderRadius: '30px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                color: '#FFFFFF',
                fontSize: 'clamp(0.95rem, 1.8vw, 1.3rem)',
                fontWeight: 500,
                letterSpacing: '0.04em',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span style={{ opacity: 0.35, fontSize: '0.75em' }}>•</span>
              <span>{client}</span>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <div
          style={{
            marginTop: '32px',
            fontSize: '0.75rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--text-faint)'
          }}
        >
          OBJ STUDIO — STAGE VISUALS & MOTION DESIGN
        </div>
      </div>
    </div>
  );
}
