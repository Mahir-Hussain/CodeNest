import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Snippets() {
    const navigate = useNavigate();
    const [snippets, setSnippets] = useState([]);
    const userid = 15; // Replace this with dynamic id later

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
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>Code Snippets</h2>
            <form onSubmit={getSnippets}>
                <button 
                    type="submit" 
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        marginBottom: '20px'
                    }}
                >
                    Fetch Snippets
                </button>
            </form>

            {/* Display fetched snippets */}
            <div>
                <p>Debug Info: Snippets array length: {snippets.length}</p>
                <p>Snippets state: {JSON.stringify(snippets)}</p>
                
                {snippets.length > 0 ? (
                    snippets.map((snippet, index) => {
                        console.log(`Rendering snippet ${index}:`, snippet);
                        return (
                            <div 
                                key={index} 
                                style={{
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    padding: '15px',
                                    marginBottom: '20px',
                                    backgroundColor: '#f9f9f9'
                                }}
                            >
                                {/* Debug: Show raw snippet data */}
                                <details style={{ marginBottom: '10px' }}>
                                    <summary style={{ cursor: 'pointer', color: '#666' }}>
                                        Raw Data (click to expand)
                                    </summary>
                                    <pre style={{ fontSize: '12px', color: '#888' }}>
                                        {JSON.stringify(snippet, null, 2)}
                                    </pre>
                                </details>
                                
                                {/* Snippet Title */}
                                <h3 style={{ 
                                    color: '#333', 
                                    marginTop: '0',
                                    borderBottom: '2px solid #007bff',
                                    paddingBottom: '5px'
                                }}>
                                    {snippet.title || snippet.name || `Snippet ${index + 1}`}
                                </h3>
                                
                                {/* Snippet Description */}
                                {(snippet.description || snippet.desc) && (
                                    <p style={{ 
                                        color: '#666', 
                                        fontStyle: 'italic',
                                        marginBottom: '15px'
                                    }}>
                                        {snippet.description || snippet.desc}
                                    </p>
                                )}
                                
                                {/* Language Tag */}
                                {(snippet.language || snippet.lang) && (
                                    <div style={{
                                        display: 'inline-block',
                                        backgroundColor: '#e9ecef',
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        color: '#495057',
                                        marginBottom: '10px'
                                    }}>
                                        {snippet.language || snippet.lang}
                                    </div>
                                )}
                                
                                {/* Code Block */}
                                <pre style={{
                                    backgroundColor: '#2d3748',
                                    color: '#e2e8f0',
                                    padding: '15px',
                                    borderRadius: '6px',
                                    overflow: 'auto',
                                    fontSize: '14px',
                                    lineHeight: '1.5',
                                    margin: '10px 0'
                                }}>
                                    <code>
                                        {snippet.code || snippet.content || snippet.snippet || JSON.stringify(snippet, null, 2)}
                                    </code>
                                </pre>
                                
                                {/* Additional metadata */}
                                <div style={{ 
                                    fontSize: '12px', 
                                    color: '#888',
                                    marginTop: '10px'
                                }}>
                                    {(snippet.created_at || snippet.date_created) && (
                                        <span>Created: {new Date(snippet.created_at || snippet.date_created).toLocaleDateString()}</span>
                                    )}
                                    {snippet.id && (
                                        <span style={{ marginLeft: '15px' }}>ID: {snippet.id}</span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        color: '#666',
                        fontSize: '16px'
                    }}>
                        No snippets found. Click "Fetch Snippets" to load your code snippets.
                    </div>
                )}
            </div>
            
            {/* Back button */}
            <button 
                onClick={() => navigate('/')} 
                style={{
                    padding: '8px 16px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginTop: '20px'
                }}
            >
                Back to Home
            </button>
        </div>
    );
}

export default Snippets;