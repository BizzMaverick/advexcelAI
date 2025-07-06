<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Always show overlay until launch date, no matter what
  const launchDate = new Date('2025-08-15T00:00:00Z').getTime();
  const now = new Date().getTime();
  const beforeLaunch = now < launchDate;

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    if (!beforeLaunch) return;
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate - now;
      setTimeLeft({
        days: Math.max(0, Math.floor(distance / (1000 * 60 * 60 * 24))),
        hours: Math.max(0, Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))),
        minutes: Math.max(0, Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))),
        seconds: Math.max(0, Math.floor((distance % (1000 * 60)) / 1000))
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [beforeLaunch, launchDate]);

  if (beforeLaunch) {
    return (
      <div className="coming-soon-overlay">
        <div className="coming-soon-content">
          <div className="logo-section">
            <img src="/vite.svg" alt="AdvExcel Logo" className="logo" />
            <h1>AdvExcel Online</h1>
          </div>
          <div className="launch-info">
            <h2>Coming Soon</h2>
            <p>Revolutionary AI-powered Excel operations are launching soon!</p>
            <div className="countdown">
              <div className="countdown-item">
                <span className="number">{timeLeft.days}</span>
                <span className="label">Days</span>
              </div>
              <div className="countdown-item">
                <span className="number">{timeLeft.hours}</span>
                <span className="label">Hours</span>
              </div>
              <div className="countdown-item">
                <span className="number">{timeLeft.minutes}</span>
                <span className="label">Minutes</span>
              </div>
              <div className="countdown-item">
                <span className="number">{timeLeft.seconds}</span>
                <span className="label">Seconds</span>
              </div>
            </div>
            <p className="launch-date">Launch Date: August 15th, 2025</p>
          </div>
          <div className="features-preview">
            <h3>What's Coming:</h3>
            <ul>
              <li>🤖 AI-powered Excel operations</li>
              <li>📊 Advanced data analytics</li>
              <li>🔧 Smart formulas and functions</li>
              <li>📈 Pivot tables and charts</li>
              <li>🎨 Conditional formatting</li>
              <li>📱 Real-time collaboration</li>
            </ul>
          </div>
          <div className="contact-info">
            <p>Questions? Contact us at <a href="mailto:contact@advexcel.online">contact@advexcel.online</a></p>
          </div>
        </div>
      </div>
    );
  }

  // After launch date, show nothing (or the real app)
  return null;
}

export default App; 
=======
import LandingPage from './LandingPage';

const App = () => {
  return <LandingPage />;
};

export default App;
>>>>>>> 21ae1af82d09521b87df252822dab1fb1422f456
