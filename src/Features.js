import React, { useEffect, useRef } from 'react';
import './Features.css';

const Features = () => {
  const featuresRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            // Add staggered animation delay for each card
            setTimeout(() => {
              entry.target.classList.add('animate-in');
            }, index * 200); // 200ms delay between each card
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: '0px 0px -50px 0px' // Start animation slightly before element is fully visible
      }
    );

    // Observe all feature cards
    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => {
      cardsRef.current.forEach((card) => {
        if (card) observer.unobserve(card);
      });
    };
  }, []);

  const features = [
    {
      icon: 'fas fa-brain',
      title: 'Adaptive Question Engine',
      description: 'Our AI adjusts the difficulty of questions based on your performance, ensuring you\'re always challenged but never overwhelmed.'
    },
    {
      icon: 'fas fa-chart-pie',
      title: 'Instant Performance Analytics',
      description: 'Receive a detailed breakdown of your strengths and weaknesses by topic the moment you finish a session. Know exactly what to study next.'
    },
    {
      icon: 'fas fa-users',
      title: 'For Candidates & Interviewers',
      description: 'Practice in a realistic environment or use our platform to create and schedule tests to streamline your technical screening process.'
    }
  ];

  return (
    <section className="features-section" ref={featuresRef}>
      <div className="features-container">
        <h2 className="features-title">Everything You Need to Succeed</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card animate-card"
              ref={(el) => cardsRef.current[index] = el}
            >
              <div className="feature-icon">
                <i className={feature.icon}></i>
              </div>
              <h3 className="feature-card-title">{feature.title}</h3>
              <p className="feature-card-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;