import "./App.css";

function App() {
  return (
    <div className="landing-page">
      <div className="content">
        <h1>Welcome to Our Platform</h1>
        <p className="tagline">
          Discover amazing features that will transform your experience
        </p>

        <div className="cta-buttons">
          <button className="primary-btn">Get Started</button>
          <button className="secondary-btn">Learn More</button>
        </div>

        <div className="features">
          <div className="feature">
            <div className="feature-icon">✨</div>
            <h3>Innovative Design</h3>
            <p>Experience our cutting-edge interface</p>
          </div>

          <div className="feature">
            <div className="feature-icon">🚀</div>
            <h3>Lightning Fast</h3>
            <p>Optimized for the best performance</p>
          </div>

          <div className="feature">
            <div className="feature-icon">🛡️</div>
            <h3>Secure Platform</h3>
            <p>Your data is always protected</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
