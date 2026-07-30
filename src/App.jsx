import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Slideshow from './components/Slideshow.jsx';
import Navigation from './components/Navigation.jsx';
import ProjectDetail from './components/ProjectDetail.jsx';

export default function App() {
  const [manifest, setManifest] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [error, setError] = useState(null);

  // Load projects.json manifest on initialization
  useEffect(() => {
    fetch('/projects.json')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load projects.json (${res.status})`);
        return res.json();
      })
      .then((data) => {
        setManifest(data);
      })
      .catch((err) => {
        console.error('Manifest fetch error:', err);
        setError(err.message);
      });
  }, []);

  // Listen for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleOpenProject = (index) => {
    if (manifest && manifest.projects[index]) {
      setCurrentIndex(index);
      setSelectedProject(manifest.projects[index]);
    }
  };

  const handleCloseProject = () => {
    setSelectedProject(null);
  };

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100dvh',
          backgroundColor: '#050505',
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
          letterSpacing: '0.05em'
        }}
      >
        {error}
      </div>
    );
  }

  if (!manifest || !manifest.projects || manifest.projects.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100dvh',
          backgroundColor: '#050505',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase'
        }}
      >
        OBJ Studio
      </div>
    );
  }

  const projects = manifest.projects;

  return (
    <main
      style={{
        position: 'relative',
        width: '100%',
        height: '100dvh',
        backgroundColor: '#050505',
        overflow: 'hidden'
      }}
    >
      {/* Homepage Selector View */}
      <Navigation
        currentIndex={currentIndex}
        totalProjects={projects.length}
      />
      
      <Slideshow
        projects={projects}
        currentIndex={currentIndex}
        onIndexChange={setCurrentIndex}
        onOpenProject={handleOpenProject}
        prefersReducedMotion={prefersReducedMotion}
      />

      {/* Dedicated Project Detail Presentation View */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectDetail
            key={selectedProject.id}
            project={selectedProject}
            onBack={handleCloseProject}
            prefersReducedMotion={prefersReducedMotion}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
