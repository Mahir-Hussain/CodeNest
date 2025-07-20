import React from 'react';
import { useNavigate } from 'react-router-dom';
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