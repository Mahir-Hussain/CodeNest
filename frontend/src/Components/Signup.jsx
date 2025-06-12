import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import './Snippets.css';

export default function Snippets() {
  const userId = parseInt(localStorage.getItem('userId'), 10);
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Route‐guard
  if (!userId || isNaN(userId)) {
    window.alert("You must be logged in to view snippets.");
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(`http://localhost:8000/get_snippets/${userId}`);
        if (!resp.ok) throw new Error(`Status ${resp.status}`);
        const data = await resp.json();
        console.log("API response:", data);

        // if your backend returned { success: true, snippets: [ rows... ] }
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
        window.alert("Error fetching snippets. See console.");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (loading) {
    return <div className="loading">Loading snippets…</div>;
  }

  return (
    <div className="app">
      <aside className="sidebar">
        {/* …sidebar/nav/filters… */}
      </aside>

      <main className="main">
        {/* …topbar with search & New Snippet button… */}

        <section className="snippet-grid">
          {snippets.length > 0 ? (
            snippets.map((s) => (
              <div className="snippet-card" key={s.id}>
                <div className="card-header">
                  <h4>{s.title}</h4>
                  <span className="lang">{s.language}</span>
                </div>
                <pre className="card-code">
                  <code>{s.content}</code>
                </pre>
                <div className="card-footer">
                  <span>ID: {s.id}</span>
                  <span>
                    {new Date(s.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
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
