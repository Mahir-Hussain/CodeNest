import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { FaUserCircle } from "react-icons/fa";
import './Snippets.css';
import Alert from './Alert'; 

export default function Snippets() {
  const userId = parseInt(localStorage.getItem('userId'), 10);
  const [snippets, setSnippets] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");
  const [loading, setLoading] = useState(true);

  if (!userId || isNaN(userId)) {
    setAlertMessage("You must be logged in to view snippets.");
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(`http://localhost:8000/get_snippets/${userId}`);
        if (!resp.ok) throw new Error(`Status ${resp.status}`);
        const data = await resp.json();
        console.log("API response:", data);

        if (data.success && Array.isArray(data.snippets)) {
          const mapped = data.snippets.map(
            ([id, title, content, language, favourite, created_at]) => ({
              id,
              title,
              content,
              language,
              favourite,
              created_at,
            })
          );
          setSnippets(mapped);
        } else {
          console.warn("Unexpected payload shape:", data);
          setSnippets([]);
        }
      } catch (err) {
        console.error("Error fetching snippets:", err);
        setAlertMessage("Error fetching snippets. See console.");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (loading) return <div className="loading">Loading snippets…</div>;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-title">All Snippets</div>

        <div className="sidebar-nav">
          <div className="nav-item active">
            <span className="nav-icon">≡</span> All Snippets
          </div>
          <div className="nav-item">
            <span className="nav-icon">★</span> Favorites
          </div>
          <div className="nav-item">
            <span className="nav-icon">⏱</span> Recently Edited
          </div>
          <div className="nav-item">
            <span className="nav-icon">🗑</span> Trash
          </div>
        </div>

        <div className="filters">
          <p className="filter-heading">LANGUAGE</p>
          <label className="checkbox-label"><input type="checkbox" defaultChecked /> Python</label>
          <label className="checkbox-label"><input type="checkbox" /> JavaScript</label>
          <label className="checkbox-label"><input type="checkbox" /> HTML</label>
          <label className="checkbox-label"><input type="checkbox" /> CSS</label>

          <p className="filter-heading">TAGS</p>
          <label className="checkbox-label"><input type="checkbox" defaultChecked /> sorting</label>
          <label className="checkbox-label"><input type="checkbox" /> api</label>
          <label className="checkbox-label"><input type="checkbox" /> regex</label>

          <p className="filter-heading">Date</p>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <input type="text" className="search-input" placeholder="Search snippets..." />
          <span className="date-created">Date Created</span>
          <span className="sort-arrow">▲▼</span>
          <button className="new-snippet-button">New Snippet</button>
          <div className="profile-icon">
            <FaUserCircle size={32} />
          </div>
        </header>

        <section className="snippet-grid">
          {snippets.length > 0 ? (
            snippets.map((s) => (
              <div className="snippet-card" key={s.id}>
                <div className="card-header">
                  <h4>{s.title}</h4>
                  <div className="lang-and-date-container">
                    <span className="lang-tag">{s.language ? s.language.toUpperCase() : ''}</span>
                    <span className="card-date">
                      {s.created_at
                        ? new Date(s.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'No date'}
                    </span>
                  </div>
                </div>
                <pre className="card-code">
                  <code>{s.content}</code>
                </pre>
                <div className="card-footer">
                  <div className="card-actions">
                    <span className="action-icon" title="Attach">📋</span>
                    <span className="action-icon" title="Link">🔗</span>
                    <span className="action-icon" title="More">⋯</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-snippets">No snippets found.</div>
          )}
        </section>
      </main>
    </div>
  );
}
