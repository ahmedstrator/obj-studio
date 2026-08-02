import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProjectSlide({
  project,
  isActive,
  prefersReducedMotion,
  onOpen
}) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const videoRefs = useRef({});

  const mediaList = project.media && project.media.length > 0 ? project.media : [];
  const totalMedia = mediaList.length;

  const currentMedia = mediaList[currentMediaIndex] || mediaList[0];

  // Control video playback based on active project slide AND active carousel item
  useEffect(() => {
    Object.keys(videoRefs.current).forEach((key) => {
      const vid = videoRefs.current[key];
      if (!vid) return;

      const itemIdx = parseInt(key, 10);
      if (isActive && itemIdx === currentMediaIndex) {
        const p = vid.play();
        if (p !== undefined) p.catch(() => {});
      } else {
        vid.pause();
      }
    });
  }, [isActive, currentMediaIndex]);

  const handleNextMedia = (e) => {
    e.stopPropagation();
    setCurrentMediaIndex((prev) => (prev + 1) % totalMedia);
  };

  const handlePrevMedia = (e) => {
    e.stopPropagation();
    setCurrentMediaIndex((prev) => (prev - 1 + totalMedia) % totalMedia);
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchStartX - touchEndX;
    if (Math.abs(deltaX) > 40) {
      if (deltaX > 0 && currentMediaIndex < totalMedia - 1) {
        setCurrentMediaIndex((prev) => prev + 1);
      } else if (deltaX < 0 && currentMediaIndex > 0) {
        setCurrentMediaIndex((prev) => prev - 1);
      }
    }
  };

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
        userSelect: 'none'
      }}
    >
      {/* Instagram-Style Media Container */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          backgroundColor: '#050505',
          paddingTop: 'clamp(52px, 8vh, 80px)',
          paddingBottom: 'clamp(150px, 22vh, 220px)',
          paddingLeft: 'clamp(16px, 4vw, 40px)',
          paddingRight: 'clamp(16px, 4vw, 40px)'
        }}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentMediaIndex}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={(e, { offset, velocity }) => {
              const swipeThreshold = 40;
              if (offset.x < -swipeThreshold || velocity.x < -250) {
                if (currentMediaIndex < totalMedia - 1) {
                  setCurrentMediaIndex((prev) => prev + 1);
                }
              } else if (offset.x > swipeThreshold || velocity.x > 250) {
                if (currentMediaIndex > 0) {
                  setCurrentMediaIndex((prev) => prev - 1);
                }
              }
            }}
            initial={{ opacity: 0.8, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0.8, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              touchAction: 'pan-y',
              cursor: 'grab'
            }}
          >
            {currentMedia && currentMedia.type === 'video' ? (
              <video
                ref={(el) => (videoRefs.current[currentMediaIndex] = el)}
                src={currentMedia.url}
                muted
                playsInline
                loop
                autoPlay
                preload="metadata"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  backgroundColor: '#050505'
                }}
              />
            ) : currentMedia && currentMedia.type === 'image' ? (
              <img
                src={currentMedia.url}
                alt={project.title}
                loading="lazy"
                className={!prefersReducedMotion ? "camera-drift" : ""}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>

        {/* Carousel Navigation Arrow Controls */}
        {totalMedia > 1 && (
          <>
            {currentMediaIndex > 0 && (
              <button
                onClick={handlePrevMedia}
                aria-label="Previous Slide"
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(5, 5, 5, 0.65)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  zIndex: 25,
                  transition: 'opacity 0.2s ease, transform 0.2s ease'
                }}
              >
                ‹
              </button>
            )}

            {currentMediaIndex < totalMedia - 1 && (
              <button
                onClick={handleNextMedia}
                aria-label="Next Slide"
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(5, 5, 5, 0.65)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  zIndex: 25,
                  transition: 'opacity 0.2s ease, transform 0.2s ease'
                }}
              >
                ›
              </button>
            )}
          </>
        )}

        {/* Instagram-Style Bottom Pagination Dots */}
        {totalMedia > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: 'clamp(95px, 14vh, 140px)',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              zIndex: 25,
              padding: '6px 12px',
              borderRadius: '20px',
              backgroundColor: 'rgba(5, 5, 5, 0.5)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }}
          >
            {mediaList.map((_, idx) => (
              <div
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentMediaIndex(idx);
                }}
                style={{
                  width: idx === currentMediaIndex ? '16px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  backgroundColor: idx === currentMediaIndex ? '#FFFFFF' : 'rgba(255, 255, 255, 0.35)',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>
        )}

        {/* Dark Contrast Vignette at Bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '45%',
            background: 'linear-gradient(to top, rgba(5, 5, 5, 0.9) 0%, rgba(5, 5, 5, 0.4) 50%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 10
          }}
        />
      </div>

      {/* Editorial Gallery Text Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 'max(32px, env(safe-area-inset-bottom))',
          left: 'max(24px, env(safe-area-inset-left))',
          right: 'max(24px, env(safe-area-inset-right))',
          maxWidth: '680px',
          zIndex: 20,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="font-category">{project.category}</span>
            <span className="font-year">{project.year}</span>
          </div>

          {/* Item Counter (e.g. 1/4) */}
          {totalMedia > 1 && (
            <span
              style={{
                fontSize: '0.75rem',
                letterSpacing: '0.15em',
                color: 'var(--text-muted)',
                fontVariantNumeric: 'tabular-nums'
              }}
            >
              {currentMediaIndex + 1} / {totalMedia}
            </span>
          )}
        </div>

        <h2 className="font-project-title" style={{ color: 'var(--text-main)' }}>
          {project.title}
        </h2>

        {project.description && (
          <p className="font-description" style={{ marginTop: '2px' }}>
            {project.description}
          </p>
        )}
      </div>
    </div>
  );
}
