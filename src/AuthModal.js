import React from 'react';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, selectedRole, onGoogleSignIn }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getRoleDisplayName = (role) => {
    return role === 'candidate' ? 'Candidate' : 'Interviewer';
  };

  const getRoleDescription = (role) => {
    if (role === 'candidate') {
      return 'Practice with AI-powered questions and ace your interviews';
    }
    return 'Create and manage adaptive interviews to find the best candidates';
  };

  return (
    <div className="auth-modal-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal-content">
        <button className="auth-modal-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        
        <div className="auth-modal-header">
          <div className="auth-modal-icon">
            <i className={`fas ${selectedRole === 'candidate' ? 'fa-graduation-cap' : 'fa-user-tie'}`}></i>
          </div>
          <h2 className="auth-modal-title">Welcome to PrepAI</h2>
          <p className="auth-modal-subtitle">
            Continue as {getRoleDisplayName(selectedRole)}
          </p>
          <p className="auth-modal-description">
            {getRoleDescription(selectedRole)}
          </p>
        </div>

        <div className="auth-modal-body">
          <button className="google-signin-btn" onClick={onGoogleSignIn}>
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="Google" 
              className="google-icon"
            />
            <span>Sign in with Google</span>
          </button>
          
          <p className="auth-modal-note">
            Your profile will be created or updated based on your choice. 
            You can switch between roles anytime after signing in.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;