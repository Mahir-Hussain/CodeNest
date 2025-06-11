import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Snippets.css';

function Snippets() {
    const navigate = useNavigate();
    const [snippets, setSnippets] = useState([]);
    const [isDark, setIsDark] = useState(false);

    const userId = parseInt(localStorage.getItem('userId'), 10);

    // Redirect if not logged in
    useEffect(() => {
        if (!userId || isNaN(userId)) {
            alert("You must be logged in to view snippets.");
            navigate('/');
        }
    }, [userId, navigate]);

    useEffect(() => {
        if (isDark) {
          document.body.style.backgroundColor = '#0d1117';
          document.body.style.color = '#f0f6fc';
        } else {
          document.body.style.backgroundColor = '#ffffff';
          document.body.style.color = '#24292f';
        }
    }, [isDark]);

    async function getSnippets(e) {
        e.preventDefault();

        if (!userId || isNaN(userId)) {
            alert("Invalid user ID. Please login again.");
            return;
        }

        try {
            console.log("Fetching snippets for userId:", userId);
            
            const response = await fetch(`http://localhost:8000/get_snippets/${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // Handle your response shape here
            const snippetsArray = Array.isArray(data) ? data : data.snippets || [];
            setSnippets(snippetsArray);
        } catch (error) {
            alert(`Failed to fetch snippets: ${error.message}`);
        }
    }

    return (
      <div className={`app ${isDark ? 'dark' : 'light'}`}>
        <button 
            className="theme-toggle" 
            onClick={() => setIsDark(!isDark)}
            aria-label="Toggle theme"
        >
            {isDark ? '☀️' : '🌙'}
        </button>

        <div className="container">
            <h2>Code Snippets</h2>
            <form onSubmit={getSnippets}>
              <button type="submit" className="fetch-button">
                Fetch Snippets
              </button>
            </form>
        
            <div>
              <p>Snippets state: {JSON.stringify(snippets)}</p>
        
              {snippets.length > 0 ? (
                snippets.map((snippet, index) => (
                  <div key={index}>
                    <details className="snippet-details">
                      <summary>Raw Data (click to expand)</summary>
                      <pre>{JSON.stringify(snippet, null, 2)}</pre>
                    </details>
              
                    <h3 className="snippet-title">
                      {snippet.title || snippet.name || `Snippet ${index + 1}`}
                    </h3>
              
                    {(snippet.description || snippet.desc) && (
                      <p className="snippet-description">
                        {snippet.description || snippet.desc}
                      </p>
                    )}
    
                    {(snippet.language || snippet.lang) && (
                      <div className="snippet-language">
                        {snippet.language || snippet.lang}
                      </div>
                    )}
    
                    <pre className="snippet-code">
                      <code>
                        {snippet.code || snippet.content || snippet.snippet || JSON.stringify(snippet, null, 2)}
                      </code>
                    </pre>
                
                    <div className="snippet-meta">
                      {(snippet.created_at || snippet.date_created) && (
                        <span>
                          Created: {new Date(snippet.created_at || snippet.date_created).toLocaleDateString()}
                        </span>
                      )}
                      {snippet.id && (
                        <span className="snippet-id">ID: {snippet.id}</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-snippets">
                  No snippets found. Click "Fetch Snippets" to load your code snippets.
                </div>
              )}
            </div>
        
            <button onClick={() => navigate('/')} className="back-button">
              Back to Home
            </button>
        </div>
      </div>
    );
}

export default Snippets;
