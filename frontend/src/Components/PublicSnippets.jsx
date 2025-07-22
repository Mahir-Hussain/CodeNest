import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './css/PublicSnippets.css';
import Alert from './services/Alert';
import pythonIcon from '../assets/python.svg'; 
import javascriptIcon from '../assets/javascript.svg';
import htmlIcon from '../assets/html.svg';
import cssIcon from '../assets/css.svg';

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

  const getLanguage = (language) => {
    const languageMap = {
      'javascript': 'javascript',
      'python': 'python',
      'html': 'markup',
      'css': 'css'
    };
    return languageMap[language?.toLowerCase()] || 'text';
  };

  const getLanguageIcon = (language) => {
    const iconMap = {
      "python": <img src={pythonIcon} alt="Python" className="language-icon" />,
      "javascript": <img src={javascriptIcon} alt="JavaScript" className="language-icon" />,
      "html": <img src={htmlIcon} alt="HTML" className="language-icon" />,
      "css": <img src={cssIcon} alt="CSS" className="language-icon" />
    };
    return iconMap[language?.toLowerCase()] || <span className="text-icon">TXT</span>;
  };

  const copyToClipboard = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      setAlertMessage("Snippet copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      setAlertMessage("Failed to copy to clipboard.");
    }
  };

  useEffect(() => {
    fetch(`${API_URL}/get_public_snippet/${snippetId}`)
      .then((res) => {
        if (res.status === 429) {
          return res.json().then(data => {
            const retryAfter = data.detail?.retry_after || 60;
            throw new Error(`Rate limit exceeded! Please wait ${retryAfter} seconds before trying again.`);
          });
        }
        if (!res.ok) throw new Error("Snippet not found");
        return res.json();
      })
      .then((data) => {
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
      })
      .catch((err) => {
        console.error("Error fetching snippet:", err);
        setAlertMessage(err.message);
      });
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
        <div className="loading">Loading...</div>
      </div>
    </>
  );

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
            backgroundColor: 'hsl(0, 0%, 95%)' // Light grey background to match Snippets.jsx
          }}
        >
          {snippet.content}
        </SyntaxHighlighter>
        <div className="card-footer">
          <div className="card-actions">
            <span className="action-icon" title="Copy to clipboard" onClick={() => copyToClipboard(snippet.content)}>📋</span>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default SnippetView;
