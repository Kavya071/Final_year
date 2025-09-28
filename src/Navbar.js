import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';

const Navbar = ({ onNavigate }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('candidate'); // 'candidate' or 'interviewer'
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleRoleSwitch = () => {
    setUserRole(userRole === 'candidate' ? 'interviewer' : 'candidate');
  };

  const handleLogin = () => {
    if (onNavigate) {
      onNavigate('login');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowProfileDropdown(false);
  };

  const getNavLinks = () => {
    if (!isLoggedIn) {
      return [
        { label: 'Home', href: '#' },
        { label: 'About', href: '#' },
        { label: 'Features', href: '#' }
      ];
    }

    if (userRole === 'candidate') {
      return [
        { label: 'Dashboard', href: '#' },
        { label: 'Practice Now', href: '#' },
        { label: 'My Results', href: '#' }
      ];
    } else {
      return [
        { label: 'Dashboard', href: '#' },
        { label: 'Create Interview', href: '#' },
        { label: 'Manage Interviews', href: '#' },
        { label: 'Analytics', href: '#' }
      ];
    }
  };

  return (
    <nav className="navbar">
      <a href="#" className="nav-logo">PrepAI</a>

      <ul className={`nav-links ${showMobileMenu ? 'active' : ''}`}>
        {getNavLinks().map((link, index) => (
          <li key={index}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
      </ul>
      
      <div className="nav-right">
        {!isLoggedIn ? (
          <div className="nav-actions-logged-out">
            <a href="#" className="action-login" onClick={handleLogin}>Login</a>
            <a href="#" className="action-signup" onClick={handleLogin}>Sign Up</a>
          </div>
        ) : (
          <div 
            className={`user-profile ${showProfileDropdown ? 'active' : ''}`}
            ref={profileRef}
            onClick={toggleProfileDropdown}
          >
            <i className="fas fa-user-circle profile-icon"></i>
            <div className="profile-dropdown">
              <a href="#">Profile</a>
              <a href="#">Settings</a>
              <div className="role-switcher">
                <span>Switch Role</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={userRole === 'interviewer'}
                    onChange={handleRoleSwitch}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <a href="#" className="logout-link" onClick={handleLogout}>Logout</a>
            </div>
          </div>
        )}
      </div>

      <div className="hamburger" onClick={toggleMobileMenu}>
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </div>
    </nav>
  );
};

export default Navbar;