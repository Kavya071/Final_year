import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../utils/firebase-config';
import '../styles/InterviewerDashboard.css';

const InterviewerDashboard = ({ onNavigate }) => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        if (onNavigate) onNavigate('login');
      }
    });

    return () => unsubscribe();
  }, [onNavigate]);

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="interviewer-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Interviewer Dashboard</h1>
          <p>Welcome back, {user.displayName || user.email}</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary">Create New Interview</button>
          <button className="btn-secondary" onClick={() => onNavigate && onNavigate('home')}>Switch to Candidate</button>
        </div>
      </div>

      <div className="dashboard-nav">
        <button 
          className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`nav-item ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          Interview Templates
        </button>
        <button 
          className={`nav-item ${activeTab === 'candidates' ? 'active' : ''}`}
          onClick={() => setActiveTab('candidates')}
        >
          Candidates
        </button>
        <button 
          className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'templates' && <TemplatesTab />}
        {activeTab === 'candidates' && <CandidatesTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
      </div>
    </div>
  );
};

const OverviewTab = () => (
  <div className="overview-tab">
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon">📋</div>
        <div className="stat-info">
          <h3>12</h3>
          <p>Active Interviews</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">👥</div>
        <div className="stat-info">
          <h3>48</h3>
          <p>Candidates Evaluated</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">⭐</div>
        <div className="stat-info">
          <h3>4.8</h3>
          <p>Avg. Rating</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">⚡</div>
        <div className="stat-info">
          <h3>85%</h3>
          <p>Success Rate</p>
        </div>
      </div>
    </div>

    <div className="quick-actions">
      <h2>Quick Actions</h2>
      <div className="action-cards">
        <div className="action-card">
          <h3>Create Interview Template</h3>
          <p>Design custom questions tailored to specific roles</p>
          <button className="btn-primary">Create Template</button>
        </div>
        <div className="action-card">
          <h3>Schedule Interview</h3>
          <p>Set up interviews for candidates with automated notifications</p>
          <button className="btn-primary">Schedule Now</button>
        </div>
        <div className="action-card">
          <h3>Review Results</h3>
          <p>Analyze candidate performance with AI insights</p>
          <button className="btn-primary">View Results</button>
        </div>
      </div>
    </div>

    <div className="recent-interviews">
      <h2>Recent Interviews</h2>
      <div className="interview-list">
        <div className="interview-item">
          <div className="candidate-info">
            <h4>Sarah Johnson</h4>
            <p>Frontend Developer Position</p>
          </div>
          <div className="interview-status">
            <span className="status completed">Completed</span>
            <span className="score">Score: 92/100</span>
          </div>
        </div>
        <div className="interview-item">
          <div className="candidate-info">
            <h4>Mike Chen</h4>
            <p>Full Stack Developer Position</p>
          </div>
          <div className="interview-status">
            <span className="status in-progress">In Progress</span>
            <span className="time">Started 15 min ago</span>
          </div>
        </div>
        <div className="interview-item">
          <div className="candidate-info">
            <h4>Emily Davis</h4>
            <p>Data Scientist Position</p>
          </div>
          <div className="interview-status">
            <span className="status scheduled">Scheduled</span>
            <span className="time">Tomorrow 2:00 PM</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TemplatesTab = () => (
  <div className="templates-tab">
    <div className="tab-header">
      <h2>Interview Templates</h2>
      <button className="btn-primary">Create New Template</button>
    </div>
    
    <div className="templates-grid">
      <div className="template-card">
        <h3>Frontend Developer</h3>
        <p>React, JavaScript, CSS, HTML</p>
        <div className="template-stats">
          <span>25 Questions</span>
          <span>60 min duration</span>
        </div>
        <div className="template-actions">
          <button className="btn-secondary">Edit</button>
          <button className="btn-primary">Use Template</button>
        </div>
      </div>
      
      <div className="template-card">
        <h3>Backend Developer</h3>
        <p>Node.js, APIs, Databases</p>
        <div className="template-stats">
          <span>30 Questions</span>
          <span>75 min duration</span>
        </div>
        <div className="template-actions">
          <button className="btn-secondary">Edit</button>
          <button className="btn-primary">Use Template</button>
        </div>
      </div>
      
      <div className="template-card">
        <h3>Data Scientist</h3>
        <p>Python, ML, Statistics</p>
        <div className="template-stats">
          <span>20 Questions</span>
          <span>90 min duration</span>
        </div>
        <div className="template-actions">
          <button className="btn-secondary">Edit</button>
          <button className="btn-primary">Use Template</button>
        </div>
      </div>
    </div>
  </div>
);

const CandidatesTab = () => (
  <div className="candidates-tab">
    <div className="tab-header">
      <h2>Candidates</h2>
      <button className="btn-primary">Invite Candidate</button>
    </div>
    
    <div className="candidates-table">
      <div className="table-header">
        <span>Name</span>
        <span>Position</span>
        <span>Status</span>
        <span>Score</span>
        <span>Date</span>
        <span>Actions</span>
      </div>
      
      <div className="table-row">
        <span>Sarah Johnson</span>
        <span>Frontend Developer</span>
        <span className="status completed">Completed</span>
        <span>92/100</span>
        <span>Oct 2, 2025</span>
        <button className="btn-link">View Details</button>
      </div>
      
      <div className="table-row">
        <span>Mike Chen</span>
        <span>Full Stack Developer</span>
        <span className="status in-progress">In Progress</span>
        <span>-</span>
        <span>Oct 3, 2025</span>
        <button className="btn-link">Monitor</button>
      </div>
      
      <div className="table-row">
        <span>Emily Davis</span>
        <span>Data Scientist</span>
        <span className="status scheduled">Scheduled</span>
        <span>-</span>
        <span>Oct 4, 2025</span>
        <button className="btn-link">Edit</button>
      </div>
    </div>
  </div>
);

const AnalyticsTab = () => (
  <div className="analytics-tab">
    <h2>Analytics & Insights</h2>
    
    <div className="analytics-grid">
      <div className="analytics-card">
        <h3>Performance Trends</h3>
        <div className="chart-placeholder">
          <p>📈 Chart showing candidate performance over time</p>
        </div>
      </div>
      
      <div className="analytics-card">
        <h3>Question Difficulty</h3>
        <div className="chart-placeholder">
          <p>📊 Breakdown of question difficulty levels</p>
        </div>
      </div>
      
      <div className="analytics-card">
        <h3>Top Skills Assessed</h3>
        <div className="skills-list">
          <div className="skill-item">
            <span>JavaScript</span>
            <div className="skill-bar">
              <div className="skill-progress" style={{width: '85%'}}></div>
            </div>
          </div>
          <div className="skill-item">
            <span>React</span>
            <div className="skill-bar">
              <div className="skill-progress" style={{width: '72%'}}></div>
            </div>
          </div>
          <div className="skill-item">
            <span>Node.js</span>
            <div className="skill-bar">
              <div className="skill-progress" style={{width: '68%'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default InterviewerDashboard;