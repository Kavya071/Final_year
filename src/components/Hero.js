import React, { useState } from 'react';
import '../styles/Hero.css';
import AuthModal from './AuthModal';

const Hero = ({ onUserLogin }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-headline">Ace Your Tech Interview with AI-Powered Practice</h1>
        <p className="hero-subheadline">
          Prepare for Data Structures, Algorithms, and SQL interviews with our adaptive question engine. 
          Get instant, detailed feedback to identify your weak spots and build confidence.
        </p>
        <div className="hero-buttons">
          <button className="cta-primary" onClick={() => setShowModal(true)}>
            Start Practice Session
          </button>
          <button className="cta-secondary">
            Learn More
          </button>
        </div>
      </div>

      <AuthModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onUserLogin={onUserLogin}
      />

      <div className="hero-visual">
        <div className="hero-illustration">
          <div className="ai-brain">
            <div className="brain-core"></div>
            <div className="neural-network">
              <div className="node node-1"></div>
              <div className="node node-2"></div>
              <div className="node node-3"></div>
              <div className="node node-4"></div>
              <div className="node node-5"></div>
              <div className="connection connection-1"></div>
              <div className="connection connection-2"></div>
              <div className="connection connection-3"></div>
              <div className="connection connection-4"></div>
            </div>
          </div>
          <div className="code-elements">
            <div className="code-block code-block-1">
              <span className="code-line"></span>
              <span className="code-line"></span>
              <span className="code-line"></span>
            </div>
            <div className="code-block code-block-2">
              <span className="code-line"></span>
              <span className="code-line"></span>
            </div>
          </div>
          <div className="floating-icons">
            <div className="icon icon-check">✓</div>
            <div className="icon icon-star">★</div>
            <div className="icon icon-rocket">🚀</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;