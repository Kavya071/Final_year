import React, { useEffect, useRef, useState } from 'react';
import '../styles/About.css';

const About = () => {
  const [isVisible, setIsVisible] = useState(false);
  const aboutRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (aboutRef.current) {
      observer.observe(aboutRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" className="about-section" ref={aboutRef}>
      <div className="about-background">
        <div className="background-pattern"></div>
      </div>
      
      <div className="container">
        <div className={`about-content ${isVisible ? 'animate-in' : ''}`}>
          <div className="about-header">
            <span className="section-tag">About Us</span>
            <h2 className="section-title">Revolutionizing Technical Interview Prep</h2>
            <p className="section-subtitle">
              Empowering developers worldwide with AI-driven preparation tools
            </p>
          </div>
          
          <div className="about-grid">
            <div className="about-main">
              <div className="story-section">
                <div className="story-card">
                  <div className="card-header">
                    <div className="icon-circle">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 11H7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-2M9 11V9a2 2 0 1 1 4 0v2M9 11h6"/>
                      </svg>
                    </div>
                    <h3>Our Mission</h3>
                  </div>
                  <p>
                    We believe technical interview preparation shouldn't be overwhelming. PrepAI adapts 
                    to your unique learning style, making complex concepts accessible and interview 
                    success achievable for everyone.
                  </p>
                </div>

                <div className="story-card">
                  <div className="card-header">
                    <div className="icon-circle">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                      </svg>
                    </div>
                    <h3>Why PrepAI?</h3>
                  </div>
                  <p>
                    Traditional practice platforms use one-size-fits-all approaches. Our AI engine 
                    analyzes your performance in real-time, adjusting difficulty and focus areas 
                    to maximize your learning efficiency.
                  </p>
                </div>

                <div className="story-card">
                  <div className="card-header">
                    <div className="icon-circle">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                      </svg>
                    </div>
                    <h3>Proven Results</h3>
                  </div>
                  <p>
                    With advanced analytics and personalized feedback, we've helped thousands of 
                    developers land their dream jobs at top tech companies. Your success is our success.
                  </p>
                </div>

                <div className="story-card">
                  <div className="card-header">
                    <div className="icon-circle">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="m22 21-3-3 3-3"/>
                      </svg>
                    </div>
                    <h3>Join Our Community</h3>
                  </div>
                  <p>
                    Connect with thousands of developers worldwide. Share experiences, learn from peers, 
                    and stay updated with the latest interview trends and industry insights.
                  </p>
                </div>
              </div>
            </div>

            <div className="about-sidebar">
              <div className="stats-container">
                <h3 className="stats-title">Impact by Numbers</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-icon">📚</div>
                    <div className="stat-content">
                      <div className="stat-number">15K+</div>
                      <div className="stat-label">Practice Questions</div>
                    </div>
                  </div>
                  
                  <div className="stat-item">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                      <div className="stat-number">50K+</div>
                      <div className="stat-label">Users Prepared</div>
                    </div>
                  </div>
                  
                  <div className="stat-item">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-content">
                      <div className="stat-number">94%</div>
                      <div className="stat-label">Success Rate</div>
                    </div>
                  </div>
                  
                  <div className="stat-item">
                    <div className="stat-icon">⚡</div>
                    <div className="stat-content">
                      <div className="stat-number">24/7</div>
                      <div className="stat-label">AI Support</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="tech-stack">
                <h4>Powered by Advanced AI</h4>
                <div className="tech-badges">
                  <span className="tech-badge">Machine Learning</span>
                  <span className="tech-badge">Adaptive Algorithms</span>
                  <span className="tech-badge">Real-time Analytics</span>
                  <span className="tech-badge">Performance Tracking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;