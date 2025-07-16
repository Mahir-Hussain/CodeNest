import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './css/PublicSnippets.css';

function SnippetView() {
  const { snippetId } = useParams();
  const [snippet, setSnippet] = useState(null);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  const getLanguage = (language) => {
    const languageMap = {
      'javascript': 'javascript',
      'python': 'python',
      'html': 'markup',
      'css': 'css'
    };
    return languageMap[language?.toLowerCase()] || 'text';
  };

  useEffect(() => {
    fetch(`${API_URL}/get_public_snippet/${snippetId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Snippet not found");
        return res.json();
      })
      .then((data) => {
        if (!data.snippet) throw new Error("Snippet not found");
        const parsedTags = typeof data.snippet.tags === "string"
          ? data.snippet.tags.replace(/[{}"]/g, "").split(",").filter(Boolean)
          : data.snippet.tags || [];

        setSnippet({ ...data.snippet, tags: parsedTags });
      })
      .catch((err) => setError(err.message));
  }, [snippetId]);

  if (error) return (
    <div className="container">
      <div className="error">⚠️ {error}</div>
    </div>
  );
  
  if (!snippet) return (
    <div className="container">
      <div className="loading">Loading...</div>
    </div>
  );

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <h1 className="title">
            {snippet.favourite && <span className="star">⭐</span>}
            {snippet.title}
          </h1>
          
          <div className="metadata">
            <span className="lang-tag">{snippet.language?.toUpperCase() || 'UNKNOWN'}</span>
            <span className="date">
              Created: {new Date(snippet.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            {snippet.tags.length > 0 && (
              <span className="tags">
                {snippet.tags.join(", ")}
              </span>
            )}
          </div>
        </div>

        <SyntaxHighlighter
          language={getLanguage(snippet.language)}
          style={tomorrow}
          customStyle={{
            borderRadius: '8px',
            minHeight: '200px',
            maxHeight: '400px',
            overflow: 'auto',
            margin: 0
          }}
        >
          {snippet.content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

export default SnippetView;
