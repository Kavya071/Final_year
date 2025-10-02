import React from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Footer from '../components/Footer';

const Home = ({ onNavigate }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      minHeight: 'calc(100vh - 80px)', // Subtract navbar height
      width: '100%',
      margin: 0,
      padding: 0
    }}>
      <Hero onUserLogin={onNavigate} />
      <About />
      <Features />
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default Home;