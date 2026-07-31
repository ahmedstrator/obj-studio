import React, { useState, useEffect, useRef } from 'react';

export default function ProjectSlide({
  project,
  isActive,
  isMountedVideo,
  prefersReducedMotion,
  onOpen
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);
  const imageRef = useRef(null);

  const mediaList = project.media && project.media.length > 0 ? project.media : [];
  // Use first video if available, otherwise first image as hero cover media
  const coverMedia = mediaList.find((m) => m.type === 'video') || mediaList[0];

  // Handle active video playback control
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

  // Handle async image decoding
  useEffect(() => {
    setImageLoaded(false);
    if (!coverMedia || coverMedia.type !== 'image') return;

    const img = new Image();
    img.src = coverMedia.url;

    if ('decode' in img) {
      img.decode()
        .then(() => setImageLoaded(true))
        .catch(() => setImageLoaded(true));
    } else {
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageLoaded(true);
    }
  }, [coverMedia]);

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
        cursor: 'pointer'
      }}
    >
      {/* Fullscreen Hero Cover Media Container */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          backgroundColor: '#050505',
          transform: isHovered ? 'scale(1.018)' : 'scale(1)',
          transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {coverMedia && coverMedia.type === 'video' ? (
          isMountedVideo ? (
            <video
              ref={videoRef}
              src={coverMedia.url}
              muted
              playsInline
              loop
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                backgroundColor: '#050505',
                willChange: 'transform'
              }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', backgroundColor: '#050505' }} />
          )
        ) : coverMedia && coverMedia.type === 'image' ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <img
              ref={imageRef}
              src={coverMedia.url}
              alt={project.title}
              className={!prefersReducedMotion ? "camera-drift" : ""}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 0.6s ease-out',
                willChange: 'transform, opacity'
              }}
            />
          </div>
        ) : (
          <div style={{ color: 'var(--text-faint)' }}>No media asset available</div>
        )}

        {/* Subtle Dark Vignette at Bottom for Contrast */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '45%',
            background: 'linear-gradient(to top, rgba(5, 5, 5, 0.88) 0%, rgba(5, 5, 5, 0.4) 50%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 10
          }}
        />
      </div>

      {/* Editorial Project Text Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 'max(28px, env(safe-area-inset-bottom))',
          left: 'max(28px, env(safe-area-inset-left))',
          right: 'max(28px, env(safe-area-inset-right))',
          maxWidth: '680px',
          zIndex: 20,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        {/* Category & Year Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span className="font-category">{project.category}</span>
          <span className="font-year">{project.year}</span>
        </div>

        {/* Project Title */}
        <h2 className="font-project-title" style={{ color: 'var(--text-main)' }}>
          {project.title}
        </h2>

        {/* Description Paragraph */}
        {project.description && (
          <p className="font-description" style={{ marginTop: '4px' }}>
            {project.description}
          </p>
        )}

        {/* Minimal Text Cue */}
        <div
          style={{
            marginTop: '12px',
            fontSize: '0.75rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: isHovered ? 'var(--text-main)' : 'var(--text-muted)',
            opacity: isHovered ? 1 : 0.65,
            transition: 'color 0.3s ease, opacity 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>See More</span>
          <span
            style={{
              fontSize: '0.9rem',
              transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
              transition: 'transform 0.3s ease'
            }}
          >
            →
          </span>
        </div>
      </div>
    </div>
  );
}
