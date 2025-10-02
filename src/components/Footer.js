import React, { useState } from 'react';
import '../styles/Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription logic here
    console.log('Newsletter subscription:', email);
    setEmail('');
    alert('Thank you for subscribing!');
  };

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-column">
          <h3 className="footer-logo">PrepAI</h3>
          <p className="footer-tagline">Smarter interview prep for everyone.</p>
          <div className="social-icons">
            <a href="#" aria-label="LinkedIn">
              <i className="fab fa-linkedin-in"></i>
            </a>
            <a href="#" aria-label="Twitter">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" aria-label="GitHub">
              <i className="fab fa-github"></i>
            </a>
            <a href="#" aria-label="YouTube">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>

        <div className="footer-column">
          <h4 className="footer-heading">Product</h4>
          <ul className="footer-links">
            <li><a href="#">Features</a></li>
            <li><a href="#">How It Works</a></li>
            <li><a href="#">Practice Now</a></li>
            <li><a href="#">For Interviewers</a></li>
            <li><a href="#">Pricing</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-heading">Company</h4>
          <ul className="footer-links">
            <li><a href="#">About Us</a></li>
            <li><a href="#">Contact</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Help Center</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-heading">Stay Updated</h4>
          <p className="newsletter-description">Get news and tips to ace your next interview.</p>
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input 
              type="email" 
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Submit</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <p>
          &copy; 2025 PrepAI. All Rights Reserved. | 
          <a href="#"> Privacy Policy</a> | 
          <a href="#"> Terms of Service</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;