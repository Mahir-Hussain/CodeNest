import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './css/Snippetview.css';
import Alert from './services/Alert';
import { getLanguage, getLanguageIcon, copyToClipboard } from './services/languageUtils';

function SnippetView() {
  const { snippetId } = useParams();
  const navigate = useNavigate();
  const [snippet, setSnippet] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

  const handleLogoClick = () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate('/snippets');
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    
    const fetchSnippet = async () => {
      try {
        // First, try the public endpoint
        let response = await fetch(`${API_URL}/get_public_snippet/${snippetId}`);
        
        // If public route fails and user is logged in, try user endpoint
        if (!response.ok && token) {
          response = await fetch(`${API_URL}/get_user_snippet/${snippetId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        
        if (response.status === 429) {
          const data = await response.json();
          const retryAfter = data.detail?.retry_after || 60;
          throw new Error(`Rate limit exceeded! Please wait ${retryAfter} seconds before trying again.`);
        }
        
        if (!response.ok) throw new Error("Snippet not found");
        
        const data = await response.json();
        if (!data.snippet) throw new Error("Snippet not found");
        
        // Parse tags properly - handle both string and array formats
        let parsedTags = [];
        if (Array.isArray(data.snippet.tags)) {
          parsedTags = data.snippet.tags;
        } else if (typeof data.snippet.tags === 'string') {
          try {
            const parsed = JSON.parse(data.snippet.tags);
            parsedTags = Array.isArray(parsed) ? parsed : [data.snippet.tags];
          } catch {
            // If JSON parse fails, treat as comma-separated string
            parsedTags = data.snippet.tags.replace(/[\[\]"{}]/g, "").split(",").filter(tag => tag.trim() !== "");
          }
        }

        setSnippet({ ...data.snippet, tags: parsedTags });
      } catch (err) {
        console.error("Error fetching snippet:", err);
        setAlertMessage(err.message);
      }
    };
    
    fetchSnippet();
  }, [snippetId]);

  if (!snippet) return (
    <>
      <header className="home-header">
        <div className="logo-container" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <img src="/CodeNest.png" alt="CodeNest" className="logo-image" />
          <h1 className="logo">CodeNest</h1>
        </div>
        <button className="login-button" onClick={() => navigate('/')}>
          Return to Homepage
        </button>
      </header>
      
      <div className="container">
        {alertMessage && <Alert message={alertMessage} onClose={() => setAlertMessage("")} />}
        <div className="loading">Loading... This may take some time if the server is waking up.</div>
      </div>
    </>
  );
  // console.log(snippet);
  return (
    <>
      <header className="home-header">
        <div className="logo-container" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <img src="/CodeNest.png" alt="CodeNest" className="logo-image" />
          <h1 className="logo">CodeNest</h1>
        </div>
        <button className="login-button" onClick={() => navigate('/')}>
          Return to Homepage
        </button>
      </header>
      
      <div className="container">
        {alertMessage && <Alert message={alertMessage} onClose={() => setAlertMessage("")} />}
      <div className="card">
        <div className="header">
          <h1 className="title">
            {snippet.favourite && <span className="star">⭐</span>}
            {snippet.title}
            <span className={`visibility-badge ${snippet.is_public ? 'public' : 'private'}`}>
              {snippet.is_public ? 'Public' : 'Private'}
              
            </span>
          </h1>
          
          <div className="metadata">
            <span className="lang-tag">{getLanguageIcon(snippet.language)} {snippet.language?.toUpperCase() || 'UNKNOWN'}</span>
            <span className="date">
              Created: {new Date(snippet.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            {snippet.tags && snippet.tags.length > 0 && (
              <span className="tags">
                {(() => {
                  if (Array.isArray(snippet.tags)) {
                    return snippet.tags.join(", ");
                  } else if (typeof snippet.tags === 'string') {
                    try {
                      const parsed = JSON.parse(snippet.tags);
                      return Array.isArray(parsed) ? parsed.join(", ") : snippet.tags;
                    } catch {
                      return snippet.tags;
                    }
                  }
                  return '';
                })()}
              </span>
            )}
          </div>
        </div>

        <SyntaxHighlighter
          language={getLanguage(snippet.language)}
          style={prism}
          customStyle={{
            borderRadius: '8px',
            minHeight: '300px',
            maxHeight: '500px',
            overflow: 'auto',
            margin: 0,
            padding: '30px',
            fontSize: '14px',
            backgroundColor: 'hsl(0, 0%, 95%)', // Light grey background to match Snippets.jsx
            lineHeight: '1.5',
            width: '100%',
            boxSizing: 'border-box'
          }}
          wrapLongLines={true}
          className="syntax-highlighter-responsive"
        >
          {snippet.content}
        </SyntaxHighlighter>
        <div className="card-footer">
          <div className="card-actions">
            <span className="action-icon" title="Copy to clipboard" onClick={() => copyToClipboard(snippet.content, setAlertMessage)}>📋</span>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default SnippetView;
