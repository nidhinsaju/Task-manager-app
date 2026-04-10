import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

function LandingPage() {
  return (
    <div className="landing-page">
      <div className="landing-container">
        {/* Header */}
        <div className="landing-header">
          <h1>Welcome to Task Hub</h1>
          <p>Organize your life, one task at a time</p>
        </div>

        {/* Description */}
        <div className="landing-description">
          <p>
            Manage your tasks efficiently and create professional labels for
            your organization. Choose one of the options below to get started.
          </p>
        </div>

        {/* Features */}
        <div className="features-grid">
          {/* Task Manager */}
          <Link
            to={`${process.env.PUBLIC_URL || ""}/task-manager`}
            className="feature-card"
          >
            <div className="card-icon">📋</div>
            <h2>Task Manager</h2>
            <p>
              Create, organize, and track your tasks. Keep everything in one
              place and stay productive.
            </p>
            <div className="cta-button">Get Started →</div>
            <p style={{ color: "red", fontWeight: "bold" }}>Inprogress !</p>
          </Link>

          {/* Label Generator */}
          <Link
            to={`${process.env.PUBLIC_URL || ""}/Coin-Label-Generator`}
            className="feature-card"
          >
            <div className="card-icon">🏷️</div>
            <h2>Coin Label Generator</h2>
            <p>
              Create beautiful printable A4 labels with flags and country names
              for your coin collections.
            </p>
            <div className="cta-button">Create Labels →</div>
          </Link>
          <Link
            to={`${process.env.PUBLIC_URL || ""}/`}
            className="feature-card"
          >
            <div className="card-icon">🔒</div>
            <h2>Coming Soon</h2>
            <p>
              We’re building something amazing for your Collection And
              Activities
            </p>
            <div className="cta-button">Coming Soon →</div>
          </Link>
        </div>

        {/* Footer */}
        <footer className="landing-footer">
          <p>© 2026 Task Hub. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;
