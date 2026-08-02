import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Preloader({ projects, onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!projects || projects.length === 0) {
      onComplete();
      return;
    }

    // Preload top 3 projects (cover media)
    const projectsToPreload = projects.slice(0, 3);
    let loadedCount = 0;
    const totalAssets = projectsToPreload.length;

    const updateProgress = () => {
      loadedCount++;
      const pct = Math.min(Math.round((loadedCount / totalAssets) * 100), 100);
      setProgress(pct);
      if (loadedCount >= totalAssets) {
        setTimeout(onComplete, 400);
      }
    };

    // Safety timeout: maximum 2.2 seconds loading screen so user is never stuck
    const safetyTimeout = setTimeout(() => {
      setProgress(100);
      setTimeout(onComplete, 300);
    }, 2200);

    projectsToPreload.forEach((proj) => {
      const mediaList = proj.media && proj.media.length > 0 ? proj.media : [];
      const coverMedia = mediaList.find((m) => m.type === 'image') || mediaList[0];

      if (!coverMedia) {
        updateProgress();
        return;
      }

      if (coverMedia.type === 'image') {
        const img = new Image();
        img.src = coverMedia.url;
        if ('decode' in img) {
          img.decode().then(updateProgress).catch(updateProgress);
        } else {
          img.onload = updateProgress;
          img.onerror = updateProgress;
        }
      } else if (coverMedia.type === 'video') {
        const vid = document.createElement('video');
        vid.src = coverMedia.url;
        vid.muted = true;
        vid.preload = 'auto';
        vid.playsInline = true;

        const handleCanPlay = () => {
          vid.removeEventListener('loadeddata', handleCanPlay);
          vid.removeEventListener('error', handleCanPlay);
          updateProgress();
        };

        vid.addEventListener('loadeddata', handleCanPlay);
        vid.addEventListener('error', handleCanPlay);
        vid.load();
      }
    });

    return () => clearTimeout(safetyTimeout);
  }, [projects, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
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
          gap: '24px'
        }}
      >
        {/* Studio Branding */}
        <div
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 700,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#FFFFFF'
          }}
        >
          OBJ STUDIO
        </div>

        {/* Minimal Progress Bar */}
        <div
          style={{
            width: '140px',
            height: '2px',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            borderRadius: '2px',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              height: '100%',
              backgroundColor: '#FFFFFF',
              borderRadius: '2px'
            }}
          />
        </div>

        {/* Percentage Counter HUD */}
        <div
          style={{
            fontSize: '0.75rem',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '0.2em',
            color: 'rgba(255, 255, 255, 0.5)',
            textTransform: 'uppercase'
          }}
        >
          PRELOADING WORK — {String(progress).padStart(2, '0')}%
        </div>
      </div>
    </motion.div>
  );
}
