import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './css/PublicSnippets.css';
import Alert from './services/Alert';

function SnippetView() {
  const { snippetId } = useParams();
  const [snippet, setSnippet] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
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
        const parsedTags = typeof data.snippet.tags === "string"
          ? data.snippet.tags.replace(/[{}"]/g, "").split(",").filter(Boolean)
          : data.snippet.tags || [];

        setSnippet({ ...data.snippet, tags: parsedTags });
      })
      .catch((err) => {
        console.error("Error fetching snippet:", err);
        setAlertMessage(err.message);
      });
  }, [snippetId]);

  if (!snippet) return (
    <div className="container">
      {alertMessage && <Alert message={alertMessage} onClose={() => setAlertMessage("")} />}
      <div className="loading">Loading...</div>
    </div>
  );

  return (
    <div className="container">
      {alertMessage && <Alert message={alertMessage} onClose={() => setAlertMessage("")} />}
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
            minHeight: '300px',
            maxHeight: '500px',
            overflow: 'auto',
            margin: 0,
            padding: '30px'
          }}
        >
          {snippet.content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

export default SnippetView;
