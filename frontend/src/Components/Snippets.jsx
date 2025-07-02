import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { FaUserCircle } from "react-icons/fa";
import './css/Snippets.css';
import Alert from './Alert';

export default function Snippets() {
  const token = localStorage.getItem("authToken");

  const [snippets, setSnippets] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);

  useEffect(() => {
    if (!token) {
      setAlertMessage("You must be logged in to view snippets.");
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const resp = await fetch("http://localhost:8000/get_snippets", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!resp.ok) throw new Error(`Status ${resp.status}`);
        const data = await resp.json();
        console.log("API response:", data);

        if (data.success && Array.isArray(data.snippets)) {
          // Convert array snippets into objects
          const formatted = data.snippets.map(s => ({
            id: s[0],
            title: s[1],
            content: s[2],
            language: s[3],
            favourite: s[4],
            created_at: s[5],
            tags: s[6],
          }));
          setSnippets(formatted);
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
  }, [token]);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (loading) return <div className="loading">Loading snippets…</div>;

  const deleteSnippet = async (snippetId) => {
    try {
      const response = await fetch(`http://localhost:8000/delete_snippet/${snippetId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setSnippets(snippets => snippets.filter(s => s.id !== snippetId));
        setAlertMessage("Snippet deleted!");
      } else {
        setAlertMessage(data.error || "Failed to delete snippet.");
      }
    } catch (error) {
      console.error("Error deleting snippet:", error);
      setAlertMessage("Error deleting snippet.");
    }
  };

  return (
    <div className="app">
      {alertMessage && <Alert message={alertMessage} onClose={() => setAlertMessage("")} />}
      <aside className={`sidebar${sidebarCollapsed ? " collapsed" : ""}`}>
        <button
          className="collapse-sidebar-btn"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
          <span className="collapse-icon">{sidebarCollapsed ? "→" : "←"}</span>
        </button>
        <div className="sidebar-title">All Snippets</div>

        <div className="sidebar-nav">
          <div className="nav-item active"><span className="nav-icon">≡</span> All Snippets</div>
          <div className="nav-item"><span className="nav-icon">★</span> Favorites</div>
          <div className="nav-item"><span className="nav-icon">⏱</span> Recently Edited</div>
          <div className="nav-item"><span className="nav-icon">🗑</span> Trash</div>
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

        <div style={{ flexGrow: 1 }} />
        <Link to="/settings" className="nav-item settings-nav">
          <span className="nav-icon" role="img" aria-label="Settings">⚙️</span> Settings
        </Link>
      </aside>

      <main className="main">
        <header className="topbar">
          <input type="text" className="search-input" placeholder="Search snippets..." />
          <button className="new-snippet-button">New Snippet</button>
          <span className="date-created">Date Created</span>
          <span className="sort-arrow">▲▼</span>
          <div style={{ flex: 1 }} />
          <div className="profile-wrapper" style={{ position: 'relative' }}>
            <div
              className="profile-icon"
              onClick={() => setProfileMenu(!profileMenu)}
              onBlur={() => setTimeout(() => setProfileMenu(false), 200)}
              style={{ cursor: 'pointer' }}>
              <FaUserCircle size={32} />
            </div>
            {profileMenu && (
              <div className="profile-menu">
                <Link to="/settings" className="profile-menu-item">Account Settings</Link>
                <button
                  className="profile-menu-item"
                  onClick={() => {
                    localStorage.removeItem('authToken');
                    setAlertMessage("You have been logged out.");
                  }}>
                  Logout
                </button>
              </div>
            )}
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
                    <span className="card-tags">---{s.tags}</span>
                  </div>
                </div>
                <pre className="card-code">
                  <code>{s.content}</code>
                </pre>
                <div className="card-footer">
                  <div className="card-actions">
                    <span className="action-icon" title="Attach">📋</span>
                    <span className="action-icon" title="Link">🔗</span>
                    <span className="action-icon" title="Edit">✏️</span>
                    <span className="action-icon" title="Delete" onClick={() => deleteSnippet(s.id)}>🗑️</span>
                    <span className="action-icon" title="Favourite">{s.favourite ? '❤️' : '🤍'}</span>
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
