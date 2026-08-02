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
        paddingTop: 'clamp(60px, 10vh, 100px)',
        paddingBottom: 'clamp(60px, 10vh, 100px)',
        paddingLeft: 'clamp(24px, 6vw, 80px)',
        paddingRight: 'clamp(24px, 6vw, 80px)',
        userSelect: 'none'
      }}
    >
      {/* Subtle Background Radial Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80vw',
          height: '80vh',
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.035) 0%, rgba(5, 5, 5, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Large Cinematic Background Watermark */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 'clamp(14rem, 30vw, 32rem)',
          fontWeight: 800,
          letterSpacing: '0.1em',
          color: 'rgba(255, 255, 255, 0.02)',
          pointerEvents: 'none',
          zIndex: 1,
          lineHeight: 1
        }}
      >
        OBJ
      </div>

      {/* Main Content Box */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '880px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '28px'
        }}
      >
        {/* Header Tag */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: isActive ? 1 : 0.5, y: isActive ? 0 : 10 }}
          transition={{ duration: 0.6 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
        >
          <span className="font-category" style={{ letterSpacing: '0.25em', color: 'rgba(255, 255, 255, 0.6)' }}>
            OTHER CLIENTS INCLUDE
          </span>
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 3.5vw, 2.6rem)',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              color: '#FFFFFF',
              marginTop: '2px'
            }}
          >
            Collaborators & Featured Artists
          </h2>
        </motion.div>

        {/* Client Roster Grid / Glassmorphic Badges */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px 14px',
            marginTop: '8px',
            maxWidth: '100%'
          }}
        >
          {clients.map((client, idx) => (
            <motion.div
              key={client}
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{
                opacity: isActive ? 1 : 0.3,
                scale: isActive ? 1 : 0.94,
                y: isActive ? 0 : 10
              }}
              whileHover={{ scale: 1.04, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.3)' }}
              transition={{ delay: idx * 0.04 + 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                padding: '12px 22px',
                borderRadius: '40px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                color: '#FFFFFF',
                fontSize: 'clamp(0.9rem, 1.6vw, 1.25rem)',
                fontWeight: 500,
                letterSpacing: '0.03em',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'default',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.6)' }} />
              <span>{client}</span>
            </motion.div>
          ))}
        </div>

        {/* Exact Footer Branding Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isActive ? 1 : 0.4 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{
            marginTop: '36px',
            fontSize: 'clamp(0.72rem, 1.2vw, 0.85rem)',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.45)',
            fontWeight: 500,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '20px',
            width: '100%'
          }}
        >
          OBJ STUDIOS — CREATIVE VISUAL STUDIO
        </motion.div>
      </div>
    </div>
  );
}
