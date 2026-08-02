import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ProjectSlide from './ProjectSlide.jsx';
import ClientRosterSlide from './ClientRosterSlide.jsx';

export default function Slideshow({
  projects,
  currentIndex,
  onIndexChange,
  onOpenProject,
  prefersReducedMotion
}) {
  const containerRef = useRef(null);
  const wheelAccumulator = useRef(0);
  const isCooldown = useRef(false);
  const touchStartY = useRef(0);

  const total = projects.length + 1; // 8 projects + 1 Client Roster slide

  const goToNext = () => {
    if (currentIndex < total - 1) {
      onIndexChange(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  };

  // Handle Wheel & Trackpad Events
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      if (isCooldown.current) return;

      wheelAccumulator.current += e.deltaY;

      if (Math.abs(wheelAccumulator.current) > 40) {
        if (wheelAccumulator.current > 0) {
          goToNext();
        } else {
          goToPrev();
        }
        isCooldown.current = true;
        wheelAccumulator.current = 0;
        setTimeout(() => {
          isCooldown.current = false;
        }, 550);
      }
    };

    const node = containerRef.current;
    if (node) {
      node.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (node) node.removeEventListener('wheel', handleWheel);
    };
  }, [currentIndex, total]);

  // Handle Keyboard Arrows
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        goToNext();
      } else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'Enter' && currentIndex < projects.length) {
        onOpenProject(currentIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, total]);

  // Handle Touch Swipe
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY.current - touchEndY;

    if (Math.abs(deltaY) > 45) {
      if (deltaY > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
  };

  const springTransition = {
    type: 'spring',
    stiffness: 260,
    damping: 32,
    mass: 0.8
  };

  const fadeTransition = {
    duration: 0.35,
    ease: [0.16, 1, 0.3, 1]
  };

  // Combine project slides + 1 client roster slide
  const allSlides = [
    ...projects.map((p) => ({ type: 'project', data: p })),
    { type: 'roster', id: 'client-roster' }
  ];

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'relative',
        width: '100%',
        height: '100dvh',
        backgroundColor: '#050505',
        overflow: 'hidden',
        touchAction: 'none'
      }}
    >
      {allSlides.map((slide, index) => {
        const isActive = index === currentIndex;
        const isPast = index < currentIndex;
        const isFuture = index > currentIndex;
        const offset = index - currentIndex;
        const isMountedVideo = offset === 0 || offset === 1;

        if (Math.abs(offset) > 2) return null;

        let translateY = '0%';
        let scale = 1;
        let opacity = 1;
        let zIndex = total - index;

        if (isActive) {
          translateY = '0%';
          scale = 1;
          opacity = 1;
          zIndex = 30;
        } else if (isPast) {
          translateY = '-8%';
          scale = 0.92;
          opacity = 0.25;
          zIndex = 10 + index;
        } else if (isFuture) {
          translateY = `${offset * 100}%`;
          scale = 1;
          opacity = 1;
          zIndex = 40 - index;
        }

        return (
          <motion.div
            key={slide.id || slide.data?.id}
            initial={false}
            animate={{
              y: translateY,
              scale: scale,
              opacity: opacity
            }}
            transition={prefersReducedMotion ? fadeTransition : springTransition}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: zIndex,
              transformOrigin: '50% 50%',
              willChange: 'transform, opacity'
            }}
          >
            {slide.type === 'project' ? (
              <ProjectSlide
                project={slide.data}
                isActive={isActive}
                isMountedVideo={isMountedVideo}
                prefersReducedMotion={prefersReducedMotion}
                onOpen={() => onOpenProject(index)}
              />
            ) : (
              <ClientRosterSlide isActive={isActive} />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
