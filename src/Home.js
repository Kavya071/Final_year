import React from 'react';
import Hero from './Hero';
import Features from './Features';
import HowItWorks from './HowItWorks';
import Footer from './Footer';

const Home = () => {
  return (
    <div style={{
      backgroundColor: 'white',
      minHeight: 'calc(100vh - 80px)', // Subtract navbar height
      width: '100%',
      margin: 0,
      padding: 0
    }}>
      <Hero />
      <Features />
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default Home;