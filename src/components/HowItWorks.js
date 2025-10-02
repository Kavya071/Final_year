import React, { useEffect, useRef } from 'react';
import '../styles/HowItWorks.css';

const HowItWorks = () => {
  const stepsRef = useRef([]);
  const titleRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Observe title
    if (titleRef.current) {
      observer.observe(titleRef.current);
    }

    // Observe all step cards with staggered delay
    stepsRef.current.forEach((step, index) => {
      if (step) {
        setTimeout(() => {
          observer.observe(step);
        }, index * 100);
      }
    });

    return () => {
      if (titleRef.current) {
        observer.unobserve(titleRef.current);
      }
      stepsRef.current.forEach((step) => {
        if (step) observer.unobserve(step);
      });
    };
  }, []);

  const steps = [
    {
      number: '01',
      icon: 'fas fa-list-check',
      title: 'Choose Your Topic',
      description: 'Select from topics like Data Structures, Algorithms, or SQL to start a focused practice session.'
    },
    {
      number: '02',
      icon: 'fas fa-laptop-code',
      title: 'Begin the Interactive Session',
      description: 'Answer questions in our unique interface as our AI adapts the difficulty based on your performance.'
    },
    {
      number: '03',
      icon: 'fas fa-chart-line',
      title: 'Analyze Your Results',
      description: 'Receive an instant, detailed report to identify your strengths and weaknesses, and guide your study plan.'
    }
  ];

  return (
    <section className="how-it-works-section">
      <div className="container">
        <h2 className="section-title animate-title" ref={titleRef}>Get Started in 3 Simple Steps</h2>
        <div className="steps-container">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="step animate-step"
              ref={(el) => stepsRef.current[index] = el}
            >
              <div className="step-number">{step.number}</div>
              <div className="step-icon">
                <i className={step.icon}></i>
              </div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;