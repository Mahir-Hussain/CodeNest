import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './css/Home.css';
import javascriptIcon from '../assets/javascript.svg';
const API_URL = import.meta.env.VITE_API_URL;

export default function Home() {
  const navigate = useNavigate();
  // Wake up server function to ensure backend is ready before login/signup
  const wakeUpServer = async () => {
    try {
      await fetch(`${API_URL}/`, { method: 'GET' });
    } catch (error) {
      console.error('Error waking up server:', error);
    }
  };
  wakeUpServer();

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="logo-container">
          <img src="/CodeNest.png" alt="CodeNest" className="logo-image" />
          <h1 className="logo">CodeNest</h1>
        </div>
        <button className="login-button" onClick={() => navigate('/login')}>Login</button>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h2>Welcome to CodeNest</h2>
          <p>Your ultimate code snippet library—secure, organized, and accessible anywhere.</p>
          <button className="cta-button" onClick={() => navigate('/signup')}>Get Started</button>
        </div>
      </section>

      <main className="home-content">
        <div className="section">
          <h3>Why CodeNest?</h3>
          <p>CodeNest streamlines how developers manage snippets. Whether you're debugging, learning, or collaborating, having instant access to your curated code library boosts productivity and consistency.</p>
        </div>

        <div className="section snippet-showcase">
          <h3>See It In Action</h3>
          <div className="showcase-container">
            <div className="showcase-left">
              <h4>Experience CodeNest Features</h4>
              <div className="feature-list">
                <div className="feature-item">
                  <span className="feature-icon">🎨</span>
                  <div>
                    <strong>Syntax Highlighting</strong>
                    <p>Beautiful color-coded display makes your code easy to read and understand at a glance.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🏷️</span>
                  <div>
                    <strong>Smart Tags</strong>
                    <p>Organize with custom tags and language labels for efficient categorization and searching.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📋</span>
                  <div>
                    <strong>One-Click Actions</strong>
                    <p>Copy, share, edit, and favorite with simple button clicks. No complex workflows needed.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="showcase-right">
              <div className="snippet-card">
                <div className="card-header">
                  <h4 className="snippet-title">
                    <span className="favorite-star">⭐ </span>
                    API Authentication Helper
                  </h4>
                  <div className="lang-and-date-container">
                    <span className="lang-tag"><img src={javascriptIcon} alt="JavaScript" className="language-icon" /> JAVASCRIPT</span>
                    <span className="card-date">July 15, 2025</span>
                    <span className="card-tags">authentication, api, jwt</span>
                  </div>
                </div>
                <SyntaxHighlighter
                  language="javascript"
                  style={tomorrow}
                  customStyle={{
                    borderRadius: '6px',
                    maxHeight: '250px',
                    overflow: 'auto',
                    margin: 0,
                    minHeight: '200px',
                    fontSize: '0.9rem'
                  }}
                >
                  {`const authenticateUser = async (token) => {
  try {
    const response = await fetch('/api/verify', {
      method: 'POST',
      headers: { 
        'Authorization': \`Bearer \${token}\`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  } catch (error) {
    console.error('Auth failed:', error);
  }
};`}
                </SyntaxHighlighter>
                <div className="card-footer">
                  <div className="card-actions">
                    <span className="action-icon" title="Copy to clipboard">📋</span>
                    <span className="action-icon" title="Share link">🔗</span>
                    <span className="action-icon" title="Edit snippet">✏️</span>
                    <span className="action-icon" title="Delete snippet">🗑️</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="section features">
          <h3>Powerful Features for Developers</h3>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-large">🔐</div>
              <h4>Encrypted Data & Security</h4>
              <p>Protect your code snippets with secure JWT authentication and bcrypt encryption, ensuring your data stays private.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-large">🎨</div>
              <h4>Beautiful Syntax</h4>
              <p>Rich syntax highlighting for 50+ languages with customizable themes for optimal readability.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-large">🔍</div>
              <h4>Smart Search</h4>
              <p>Real-time search across titles, content, tags, and languages. Find exactly what you need, fast.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-large">🤖</div>
              <h4>AI-Powered</h4>
              <p>Google Generative AI automatically adds meaningful titles and tags for your snippets.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-large">🔗</div>
              <h4>Easy Sharing</h4>
              <p>Share your code snippets publicly with clean, readable URLs or keep them private.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-large">📱</div>
              <h4>Cross-Platform</h4>
              <p>Access your snippets anywhere with our responsive web app that works on all devices.</p>
            </div>
          </div>
        </div>

        <div className="section workflow">
          <h3>Your Workflow, Streamlined</h3>
          <div className="workflow-steps">
            <div className="workflow-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Create & Organize</h4>
                <p>Add your code snippets with intelligent tagging and categorization. Our AI helps with titles and organization.</p>
              </div>
            </div>
            <div className="workflow-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Search & Filter</h4>
                <p>Find exactly what you need with powerful search and filtering by language, tags, or favorites.</p>
              </div>
            </div>
            <div className="workflow-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Share & Collaborate</h4>
                <p>Share snippets publicly or keep them private. Perfect for team collaboration and knowledge sharing.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="section tech-stack">
          <h3>Built with Modern Technology</h3>
          <p className="tech-description">CodeNest leverages cutting-edge technologies to deliver a fast, reliable, and secure experience.</p>
          <div className="tech-categories">
            <div className="tech-category">
              <h4>Frontend</h4>
              <div className="tags">
                <span className="tag react">React</span>
                <span className="tag css">CSS</span>
              </div>
            </div>
            <div className="tech-category">
              <h4>Backend</h4>
              <div className="tags">
                <span className="tag python">FastAPI</span>
                <span className="tag python">Python</span>
              </div>
            </div>
            <div className="tech-category">
              <h4>Database & AI</h4>
              <div className="tags">
                <span className="tag postgres">PostgreSQL</span>
                <span className="tag ai">Google AI</span>
              </div>
            </div>
          </div>
        </div>

        <div className="section cta-section">
          <div className="cta-content">
            <h3>Ready to organize your code?</h3>
            <p>Manage your code snippets efficiently and securely.</p>
            <div className="cta-buttons">
              <button className="cta-button primary" onClick={() => navigate('/signup')}>
                Get Started
              </button>
              <button className="cta-button secondary" onClick={() => navigate('/login')}>
                Sign In
              </button>
            </div>
          </div>
        </div>

        <div className="section open-source">
          <h3>Open Source & Collaborative</h3>
          <p>CodeNest is built in the open. Check out our code, contribute, or fork the project to make it your own.</p>
          <div className="github-stats">
            <a href="https://github.com/Mahir-Hussain/CodeNest" target="_blank" rel="noopener noreferrer" className="github-link">
              <span className="github-icon">⭐</span>
              <span>Star on GitHub</span>
            </a>
            <a href="https://github.com/Mahir-Hussain/CodeNest/issues" target="_blank" rel="noopener noreferrer" className="github-link">
              <span className="github-icon">🐛</span>
              <span>Report Issues</span>
            </a>
            <a href="https://github.com/Mahir-Hussain/CodeNest/fork" target="_blank" rel="noopener noreferrer" className="github-link">
              <span className="github-icon">🔀</span>
              <span>Fork Project</span>
            </a>
          </div>
        </div>
      </main>

      <footer className="home-footer">
        <p>© {new Date().getFullYear()} CodeNest. <a href="https://github.com/Mahir-Hussain/CodeNest" target="_blank" rel="noopener noreferrer">GitHub Repo</a></p>
      </footer>
    </div>
  );
}