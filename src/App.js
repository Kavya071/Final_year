import React, { useState } from 'react';
import Navbar from './Navbar';
import Home from './Home';
import LoginSignup from './LoginSignup';
import CandidateTest from './CandidateTest';
import CandidateDashboard from './CandidateDashboard';
import TestMongoDB from './TestMongoDB';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const navigateToPage = (page) => {
    console.log('Navigation requested to:', page);
    setCurrentPage(page);
    console.log('Current page set to:', page);
  };

  const renderCurrentPage = () => {
    switch(currentPage) {
      case 'login':
        return <LoginSignup onNavigate={navigateToPage} />;
      case 'candidate-test':
        return <CandidateTest onNavigate={navigateToPage} />;
      case 'candidate-dashboard':
        return <CandidateDashboard onNavigate={navigateToPage} />;
      case 'test-mongodb':
        return <TestMongoDB />;
      case 'home':
      default:
        return <Home />;
    }
  };

  return (
    <div className="App">
      {currentPage !== 'login' && currentPage !== 'candidate-test' && currentPage !== 'candidate-dashboard' && currentPage !== 'test-mongodb' && <Navbar onNavigate={navigateToPage} />}
      {renderCurrentPage()}
    </div>
  );
}

export default App;