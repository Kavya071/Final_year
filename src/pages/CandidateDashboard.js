import React, { useState, useEffect } from 'react';
import '../styles/CandidateDashboard.css';
import { useDSAProblems } from '../utils/hooks/useDSAProblems';

const CandidateDashboard = ({ onNavigate, userName = "Kavya Bhardwaj" }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { stats, backendStatus, loadStats, checkBackendHealth } = useDSAProblems();

  // Load stats on component mount
  useEffect(() => {
    loadStats();
    checkBackendHealth();
  }, [loadStats, checkBackendHealth]);

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleViewChange = (view) => {
    setActiveView(view);
  };

  const handleUserMenuToggle = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    // Add logout logic here
    if (onNavigate) {
      onNavigate('home');
    }
  };

  const handleStartPractice = (topic) => {
    console.log(`Starting practice for: ${topic}`);
    // Navigate to practice test
    if (onNavigate) {
      onNavigate('candidate-test');
    }
  };

  const handleJoinTest = (testId) => {
    console.log(`Joining test: ${testId}`);
    // Navigate to actual test
    if (onNavigate) {
      onNavigate('candidate-test');
    }
  };

  // Sample data
  const testHistory = [
    {
      id: 1,
      type: 'Interview Test',
      topic: 'DSA Fundamentals',
      score: '85/100',
      status: 'Passed',
      passed: true
    },
    {
      id: 2,
      type: 'Practice Session',
      topic: 'SQL Joins',
      score: '7/10',
      status: 'Completed',
      passed: false
    },
    {
      id: 3,
      type: 'Interview Test',
      topic: 'System Design',
      score: '92/100',
      status: 'Passed',
      passed: true
    }
  ];

  const upcomingTests = [
    {
      id: 1,
      topic: 'Advanced Algorithms',
      interviewer: 'Jane Doe',
      date: '25th Sept, 2025',
      time: '11:00 AM IST'
    },
    {
      id: 2,
      topic: 'Database Design',
      interviewer: 'John Smith',
      date: '28th Sept, 2025',
      time: '2:00 PM IST'
    }
  ];

  const practiceTopics = [
    {
      id: 'dsa',
      title: 'Data Structures & Algorithms',
      description: 'Sharpen your core DSA skills.',
      icon: 'fas fa-project-diagram'
    },
    {
      id: 'sql',
      title: 'SQL',
      description: 'Master database queries and logic.',
      icon: 'fas fa-database'
    },
    {
      id: 'aptitude',
      title: 'Aptitude',
      description: 'Test your logical reasoning skills.',
      icon: 'fas fa-brain'
    },
    {
      id: 'system-design',
      title: 'System Design',
      description: 'Learn to design scalable systems.',
      icon: 'fas fa-sitemap'
    }
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <a href="#" className="sidebar-logo">PrepAI</a>
          <button className="sidebar-toggle-btn" onClick={handleSidebarToggle}>
            <i className="fas fa-chevron-left"></i>
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <a 
            href="#" 
            className={`nav-link ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); handleViewChange('dashboard'); }}
          >
            <i className="fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </a>
          <a 
            href="#" 
            className={`nav-link ${activeView === 'upcoming' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); handleViewChange('upcoming'); }}
          >
            <i className="fas fa-calendar-alt"></i>
            <span>Upcoming Tests</span>
          </a>
          <a 
            href="#" 
            className={`nav-link ${activeView === 'practice' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); handleViewChange('practice'); }}
          >
            <i className="fas fa-dumbbell"></i>
            <span>Practice Section</span>
          </a>
        </nav>

        <div className={`user-profile-menu ${userMenuOpen ? 'active' : ''}`}>
          <div className="user-info" onClick={handleUserMenuToggle}>
            <i className="fas fa-user-circle"></i>
            <span>{userName}</span>
          </div>
          <div className="logout-tooltip">
            <a href="#" className="logout-btn" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <section className="content-view active">
            <h1>Dashboard</h1>
            
            {/* Database Stats Card */}
            <div className="stats-card">
              <h2>
                <i className="fas fa-database"></i>
                DSA Problem Database
                <span className={`status-indicator ${backendStatus}`}>
                  {backendStatus === 'connected' ? '🟢' : 
                   backendStatus === 'disconnected' ? '🔴' : 
                   backendStatus === 'error' ? '⚠️' : '⚪'}
                </span>
              </h2>
              {stats ? (
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-number">{stats.totalProblems}</span>
                    <span className="stat-label">Total Problems</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{stats.difficultyDistribution?.Easy || 0}</span>
                    <span className="stat-label">Easy</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{stats.difficultyDistribution?.Medium || 0}</span>
                    <span className="stat-label">Medium</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{stats.difficultyDistribution?.Hard || 0}</span>
                    <span className="stat-label">Hard</span>
                  </div>
                </div>
              ) : (
                <p className="stats-loading">
                  {backendStatus === 'connected' ? 'Loading database stats...' : 'Database connection unavailable'}
                </p>
              )}
            </div>

            <h2>Test History</h2>
            <div className="test-history-list">
              {testHistory.map(test => (
                <div key={test.id} className={`history-card ${test.type.toLowerCase().includes('practice') ? 'practice' : 'interview'}`}>
                  <div className="card-main-info">
                    <span className="test-type">{test.type}</span>
                    <h3 className="test-topic">{test.topic}</h3>
                  </div>
                  <div className="card-details">
                    <span className="score">Score: {test.score}</span>
                    <span className={`status ${test.passed ? 'passed' : ''}`}>{test.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Tests View */}
        {activeView === 'upcoming' && (
          <section className="content-view active">
            <h1>Upcoming Tests</h1>
            <div className="card-grid">
              {upcomingTests.map(test => (
                <div key={test.id} className="upcoming-test-card">
                  <h3>{test.topic}</h3>
                  <p><i className="fas fa-user-tie"></i> By: {test.interviewer}</p>
                  <p><i className="fas fa-calendar-alt"></i> Date: {test.date}</p>
                  <p><i className="fas fa-clock"></i> Time: {test.time}</p>
                  <button className="join-btn" onClick={() => handleJoinTest(test.id)}>
                    Join Now
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Practice Section View */}
        {activeView === 'practice' && (
          <section className="content-view active">
            <h1>Practice Section</h1>
            <div className="card-grid">
              {practiceTopics.map(topic => (
                <div key={topic.id} className="practice-card">
                  <i className={`${topic.icon} card-icon`}></i>
                  <h3>{topic.title}</h3>
                  <p>{topic.description}</p>
                  <button className="start-btn" onClick={() => handleStartPractice(topic.id)}>
                    Start Practice
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default CandidateDashboard;