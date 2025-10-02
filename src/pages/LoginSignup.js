import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../utils/firebase-config';
import { signInWithGoogle, saveUserRole } from '../utils/firebaseAuth';
import AuthModal from '../components/AuthModal';
import '../styles/LoginSignup.css';

const LoginSignup = ({ onNavigate }) => {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe(); // Cleanup subscription
  }, []);

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
    setShowModal(true);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const userData = await signInWithGoogle();
      
      // Save the selected role to Firestore
      await saveUserRole(userData, selectedRole);
      
      // Close modal first
      setShowModal(false);
      
      // Wait a brief moment for modal to close, then navigate
      setTimeout(() => {
        // Navigate based on role immediately
        if (selectedRole === 'candidate') {
          // Navigate to candidate dashboard
          console.log('User is candidate, navigating to dashboard...');
          console.log('onNavigate function exists:', !!onNavigate);
          if (onNavigate) {
            console.log('Calling onNavigate with candidate-dashboard');
            onNavigate('candidate-dashboard');
          } else {
            console.error('onNavigate function not provided!');
          }
        } else {
          // Navigate to interviewer dashboard
          console.log('User is interviewer, navigating to interviewer dashboard...');
          if (onNavigate) {
            console.log('Calling onNavigate with interviewer-dashboard');
            onNavigate('interviewer-dashboard');
          } else {
            console.error('onNavigate function not provided!');
          }
        }
      }, 100);
      
      console.log(`User signed in as ${selectedRole}:`, userData);
      
    } catch (error) {
      console.error('Error during sign-in:', error);
      alert('Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedRole('');
  };

  const handleBackToHome = () => {
    if (onNavigate) {
      onNavigate('home');
    }
  };

  return (
    <div className="login-signup-page">
      <div className="split-screen-container">
        <div className="split-side interviewer-side" id="interviewer-side">
          <div className="side-background-overlay"></div>
          <div className="side-content-wrapper">
            <div className="side-icon">
              <i className="fas fa-user-tie"></i>
            </div>
            <h2 className="side-title">For Interviewers</h2>
            <div className="side-content">
              <p>Create, schedule, and review adaptive interviews to find the best candidates efficiently.</p>
              <ul className="feature-list">
                <li><i className="fas fa-check"></i> Create custom interview templates</li>
                <li><i className="fas fa-check"></i> Real-time candidate analytics</li>
                <li><i className="fas fa-check"></i> Automated screening process</li>
              </ul>
              <button 
                className="side-button"
                onClick={() => handleRoleSelection('interviewer')}
                disabled={loading}
              >
                {loading && selectedRole === 'interviewer' ? 'Loading...' : 'Continue as Interviewer'}
              </button>
            </div>
          </div>
        </div>

        <div className="split-side candidate-side" id="candidate-side">
          <div className="side-background-overlay"></div>
          <div className="side-content-wrapper">
            <div className="side-icon">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <h2 className="side-title">For Candidates</h2>
            <div className="side-content">
              <p>Practice with AI-powered questions, get instant feedback, and ace your next tech interview.</p>
              <ul className="feature-list">
                <li><i className="fas fa-check"></i> Adaptive difficulty questions</li>
                <li><i className="fas fa-check"></i> Instant performance feedback</li>
                <li><i className="fas fa-check"></i> Track your progress</li>
              </ul>
              <button 
                className="side-button"
                onClick={() => handleRoleSelection('candidate')}
                disabled={loading}
              >
                {loading && selectedRole === 'candidate' ? 'Loading...' : 'Continue as Candidate'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Back to home link */}
      <div className="back-to-home">
        <button className="back-link" onClick={handleBackToHome}>
          <i className="fas fa-arrow-left"></i> Back to Home
        </button>
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showModal}
        onClose={handleModalClose}
        selectedRole={selectedRole}
        onGoogleSignIn={handleGoogleSignIn}
      />
    </div>
  );
};

export default LoginSignup;