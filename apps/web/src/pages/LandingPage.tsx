import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';

export function LandingPage() {
  return (
    <header className="landing-header">
      <Navbar />

      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">Portfolio Management Dashboard</p>

          <h1>Track, manage, and grow your investments with confidence.</h1>

          <p className="hero-description">
            Monitor asset allocation, investment performance, transaction
            history, and portfolio value from one clean dashboard.
          </p>

          <div className="hero-actions">
            <Link className="button button--primary" to="/login">
              Get Started
            </Link>
            {/* <button className="secondary-button" type="button">
              View Dashboard
            </button> */}
          </div>

          <div className="hero-metrics">
            <div>
              <strong>+18.4%</strong>
              <span>Portfolio Growth</span>
            </div>
            <div>
              <strong>120+</strong>
              <span>Assets Tracked</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>Performance View</span>
            </div>
          </div>
        </div>

        <div className="chart-card" aria-label="Portfolio growth chart">
          <div className="chart-header">
            <div>
              <p>Total Portfolio Value</p>
              <h2>$248,930</h2>
            </div>
            <span>+12.8%</span>
          </div>

          <div className="growth-chart">
            <svg viewBox="0 0 520 260" role="img">
              <defs>
                <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>

              <path
                className="chart-area"
                d="M20 210 C90 180, 115 190, 160 150 C205 110, 240 135, 280 95 C325 48, 360 85, 405 55 C455 25, 485 45, 500 30 L500 240 L20 240 Z"
              />

              <path
                className="chart-line"
                d="M20 210 C90 180, 115 190, 160 150 C205 110, 240 135, 280 95 C325 48, 360 85, 405 55 C455 25, 485 45, 500 30"
              />

              <circle cx="500" cy="30" r="7" className="chart-dot" />
            </svg>
          </div>

          <div className="chart-footer">
            <div>
              <span>Stocks</span>
              <strong>58%</strong>
            </div>
            <div>
              <span>Bonds</span>
              <strong>24%</strong>
            </div>
            <div>
              <span>Funds</span>
              <strong>18%</strong>
            </div>
          </div>
        </div>
      </section>
    </header>
  );
}