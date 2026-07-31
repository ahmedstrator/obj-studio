import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ProjectSlide from './ProjectSlide.jsx';

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

  const total = projects.length;

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
      } else if (e.key === 'Enter') {
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
      {projects.map((project, index) => {
        const isActive = index === currentIndex;
        const isPast = index < currentIndex;
        const isFuture = index > currentIndex;
        const isMountedVideo = isActive;

        if (Math.abs(offset) > 2) return null;

        if (prefersReducedMotion) {
          return (
            <motion.div
              key={project.id}
              initial={false}
              animate={{
                opacity: isActive ? 1 : 0,
                pointerEvents: isActive ? 'auto' : 'none'
              }}
              transition={fadeTransition}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                willChange: 'opacity'
              }}
            >
              <ProjectSlide
                project={project}
                isActive={isActive}
                isMountedVideo={isMountedVideo}
                prefersReducedMotion={true}
                onOpen={() => onOpenProject(index)}
              />
            </motion.div>
          );
        }

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
            key={project.id}
            initial={false}
            animate={{
              y: translateY,
              scale: scale,
              opacity: opacity
            }}
            transition={springTransition}
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
            <ProjectSlide
              project={project}
              isActive={isActive}
              isMountedVideo={isMountedVideo}
              prefersReducedMotion={false}
              onOpen={() => onOpenProject(index)}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
