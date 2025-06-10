import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Snippets.css';

function Snippets() {
    const navigate = useNavigate();
    const [snippets, setSnippets] = useState([]);
    const userid = 15; // Replace this with dynamic id later
    const [isDark, setIsDark] = useState(false);

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

        try {
            console.log("Fetching snippets for userid:", userid);
            
            const response = await fetch(`http://localhost:8000/get_snippets/17`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            console.log("Response status:", response.status);
            console.log("Response ok:", response.ok);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Raw data received:", data);
            console.log("Data type:", typeof data);
            console.log("Is array?", Array.isArray(data));
            console.log("Data length:", data?.length);
            
            setSnippets(data);
        } catch (error) {
            console.error("Full error:", error);
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
              <p>Debug Info: Snippets array length: {snippets.length}</p>
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