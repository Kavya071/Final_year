import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import LoginSignup from './pages/LoginSignup';
import CandidateTest from './pages/CandidateTest';
import CandidateDashboard from './pages/CandidateDashboard';
import InterviewerDashboard from './pages/InterviewerDashboard';
import './styles/App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const navigateToPage = (page) => {
    console.log('Navigation requested to:', page);
    setCurrentPage(page);
    console.log('Current page set to:', page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={navigateToPage} />;
      case 'login':
        return <LoginSignup onNavigate={navigateToPage} />;
      case 'candidate-dashboard':
        return <CandidateDashboard onNavigate={navigateToPage} />;
      case 'candidate-test':
        return <CandidateTest onNavigate={navigateToPage} />;
      case 'interviewer-dashboard':
        return <InterviewerDashboard onNavigate={navigateToPage} />;
      default:
        return <Home onNavigate={navigateToPage} />;
    }
  };

  return (
    <div className="App">
      <Navbar onNavigate={navigateToPage} />
      {renderCurrentPage()}
    </div>
  );
}

export default App;