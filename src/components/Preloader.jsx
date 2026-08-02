import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Preloader({ projects, onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 3-second smooth linear progress timer (3000ms)
    const startTime = Date.now();
    const DURATION = 3000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.round((elapsed / DURATION) * 100), 100);
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(onComplete, 400);
      }
    }, 30);

    // Concurrently pre-buffer top 3 projects
    if (projects && projects.length > 0) {
      const projectsToPreload = projects.slice(0, 3);
      projectsToPreload.forEach((proj) => {
        const mediaList = proj.media && proj.media.length > 0 ? proj.media : [];
        mediaList.forEach((media) => {
          if (media.type === 'image') {
            const img = new Image();
            img.src = media.url;
            if ('decode' in img) img.decode().catch(() => {});
          } else if (media.type === 'video') {
            const vid = document.createElement('video');
            vid.src = media.url;
            vid.muted = true;
            vid.preload = 'auto';
            vid.playsInline = true;
            vid.load();
          }
        });
      });
    }

    return () => clearInterval(interval);
  }, [projects, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100dvh',
        backgroundColor: '#050505',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#FFFFFF',
        userSelect: 'none'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '28px'
        }}
      >
        {/* Studio Branding */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 700,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: '#FFFFFF',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.2)'
          }}
        >
          OBJ STUDIO
        </motion.div>

        {/* Minimal Glowing Progress Bar */}
        <div
          style={{
            width: '180px',
            height: '2px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <motion.div
            style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: '#FFFFFF',
              borderRadius: '2px',
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
            }}
          />
        </div>

        {/* Percentage Counter HUD */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{
            fontSize: '0.75rem',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '0.22em',
            color: 'rgba(255, 255, 255, 0.55)',
            textTransform: 'uppercase'
          }}
        >
          INITIALIZING GALLERY — {String(progress).padStart(2, '0')}%
        </motion.div>
      </div>
    </motion.div>
  );
}
