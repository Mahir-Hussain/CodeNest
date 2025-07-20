import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './css/Home.css';

export default function Home() {
  const navigate = useNavigate();

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
                    <span className="lang-tag">🟨 JAVASCRIPT</span>
                    <span className="card-date">Dec 15, 2024</span>
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
          <h3>Key Features</h3>
          <ul>
            <li>🔐 <strong>Secure Auth</strong> with JWT & bcrypt</li>
            <li>🔒 <strong>Encrypted Storage</strong> for user data</li>
            <li>📂 <strong>Organize Snippets</strong> by language and tags</li>
            <li>🔍 <strong>Real-Time Search</strong> & filtering</li>
            <li>🤖 <strong>AI-Powered Titles</strong> via Google Generative AI</li>
          </ul>
        </div>

        <div className="section tech-stack">
          <h3>Tech Stack</h3>
          <div className="tags">
            {['React', 'Vite', 'FastAPI', 'PostgreSQL', 'JWT', 'Docker'].map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        </div>

        <div className="section team">
          <h3>Collaboration</h3>
          <p>Built in partnership with a fellow developer. We leveraged GitHub for version control, code reviews, and agile workflows.</p>
        </div>
      </main>

      <footer className="home-footer">
        <p>© {new Date().getFullYear()} CodeNest. <a href="https://github.com/Mahir-Hussain/CodeNest" target="_blank" rel="noopener noreferrer">GitHub Repo</a></p>
      </footer>
    </div>
  );
}