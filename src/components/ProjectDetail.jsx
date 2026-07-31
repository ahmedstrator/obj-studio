import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function ProjectDetail({ project, onBack, prefersReducedMotion }) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const containerRef = useRef(null);
  const wheelAccumulator = useRef(0);
  const isCooldown = useRef(false);
  const touchStartY = useRef(0);

  const mediaList = project.media && project.media.length > 0 ? project.media : [];
  const totalMedia = mediaList.length;

  const goToNext = () => {
    setActiveMediaIndex((prev) => Math.min(prev + 1, totalMedia - 1));
  };

  const goToPrev = () => {
    setActiveMediaIndex((prev) => Math.max(prev - 1, 0));
  };

  // Wheel & Trackpad Navigation with weighted inertia accumulator
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      if (isCooldown.current) return;

      wheelAccumulator.current += e.deltaY;

      if (Math.abs(wheelAccumulator.current) > 35) {
        if (wheelAccumulator.current > 0) {
          goToNext();
        } else {
          goToPrev();
        }
        isCooldown.current = true;
        wheelAccumulator.current = 0;
        setTimeout(() => {
          isCooldown.current = false;
        }, 450);
      }
    };

    const node = containerRef.current;
    if (node) {
      node.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (node) node.removeEventListener('wheel', handleWheel);
    };
  }, [totalMedia]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        goToNext();
      } else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'Escape') {
        onBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalMedia]);

  // Touch Swipe Handling
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY.current - touchEndY;
    if (Math.abs(deltaY) > 40) {
      if (deltaY > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
  };

  const springTransition = {
    type: 'spring',
    stiffness: 280,
    damping: 34,
    mass: 0.8
  };

  const currentFormatted = String(activeMediaIndex + 1).padStart(2, '0');
  const totalFormatted = String(totalMedia).padStart(2, '0');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100dvh',
        backgroundColor: '#050505',
        zIndex: 100,
        overflow: 'hidden'
      }}
    >
      {/* Top Navigation HUD */}
      <header
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          paddingTop: 'max(24px, env(safe-area-inset-top))',
          paddingLeft: 'max(28px, env(safe-area-inset-left))',
          paddingRight: 'max(28px, env(safe-area-inset-right))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 150,
          pointerEvents: 'none'
        }}
      >
        {/* Back Control */}
        <button
          onClick={onBack}
          aria-label="Back to Selected Work"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-main)',
            fontSize: '0.85rem',
            fontWeight: 500,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: 0.85,
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.85')}
        >
          <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>←</span>
          <span>Selected Work</span>
        </button>

        {/* Counter HUD */}
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
      </header>

      {/* Media Presentation Deck Container */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          touchAction: 'none'
        }}
      >
        {mediaList.map((media, index) => {
          const isActive = index === activeMediaIndex;
          const isPast = index < activeMediaIndex;
          const isFuture = index > activeMediaIndex;
          const offset = index - activeMediaIndex;
          const isMountedVideo = Math.abs(offset) <= 1;

          if (Math.abs(offset) > 2) return null;

          let translateY = '0%';
          let scale = 1;
          let zIndex = 10;

          if (isActive) {
            translateY = '0%';
            scale = 1;
            zIndex = 40;
          } else if (isPast) {
            translateY = '-100%';
            scale = 0.96;
            zIndex = 20;
          } else if (isFuture) {
            translateY = '100%';
            scale = 1;
            zIndex = 30;
          }

          return (
            <motion.div
              key={media.id || index}
              initial={false}
              animate={{
                y: translateY,
                scale: scale,
                opacity: 1
              }}
              transition={springTransition}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: zIndex,
                willChange: 'transform'
              }}
            >
              <ProjectMediaItem
                media={media}
                project={project}
                isActive={isActive}
                isMountedVideo={isMountedVideo}
                prefersReducedMotion={prefersReducedMotion}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Disappearing Introductory Text (Visible on item 0, fades away on subsequent items) */}
      <div
        style={{
          position: 'absolute',
          bottom: 'max(28px, env(safe-area-inset-bottom))',
          left: 'max(28px, env(safe-area-inset-left))',
          right: 'max(28px, env(safe-area-inset-right))',
          maxWidth: '680px',
          zIndex: 120,
          pointerEvents: 'none',
          opacity: activeMediaIndex === 0 ? 1 : 0,
          transform: activeMediaIndex === 0 ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span className="font-category">{project.category}</span>
          <span className="font-year">{project.year}</span>
        </div>
        <h1 className="font-project-title">{project.title}</h1>
        {project.description && (
          <p className="font-description">{project.description}</p>
        )}
      </div>
    </motion.div>
  );
}

// Sub-component for individual project media asset item inside project detail
function ProjectMediaItem({
  media,
  project,
  isActive,
  isMountedVideo,
  prefersReducedMotion
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } else {
      videoRef.current.pause();
    }
  }, [isActive, isMountedVideo]);

  useEffect(() => {
    if (!media || media.type !== 'image') return;
    setImageLoaded(false);
    const img = new Image();
    img.src = media.url;
    if ('decode' in img) {
      img.decode()
        .then(() => setImageLoaded(true))
        .catch(() => setImageLoaded(true));
    } else {
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageLoaded(true);
    }
  }, [media]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#050505',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'clamp(24px, 4vw, 56px)'
      }}
    >
      {/* Contained Media Board (preserving aspect ratio and composition) */}
      <div
        style={{
          position: 'relative',
          width: '90%',
          height: '86%',
          maxWidth: '1600px',
          maxHeight: '900px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          borderRadius: '4px',
          backgroundColor: '#050505'
        }}
      >
        {media.type === 'video' ? (
          isMountedVideo ? (
            <video
              ref={videoRef}
              src={media.url}
              muted
              playsInline
              loop
              autoPlay
              preload="auto"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                backgroundColor: '#050505'
              }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', backgroundColor: '#050505' }} />
          )
        ) : (
          <img
            src={media.url}
            alt={project.title}
            className={!prefersReducedMotion ? "camera-drift" : ""}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              opacity: imageLoaded ? 1 : 0,
              transition: 'opacity 0.6s ease-out'
            }}
          />
        )}
      </div>
    </div>
  );
}
