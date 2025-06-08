import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Snippets() {
    const navigate = useNavigate();
    const [snippets, setSnippets] = useState([]);
    const userid = 14; // Replace this with dynamic id later

    async function getSnippets(e) {
        e.preventDefault();

        try {
            const response = await fetch(`http://localhost:8000/get_snippets`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userid }),
            });

            if (!response.ok) {
                throw new Error("HTTP error");
            }

            const data = await response.json()
            setSnippets(data); // Save snippets to state
            console.log("Snippets:", data);
        } catch (error) {
            console.error(error);
            alert("Failed to fetch snippets. Try again.");
        }
    }

    return (
        <div>
            <h2>Get Snippets</h2>
            <form onSubmit={getSnippets}>
                <button type="submit">Fetch Snippets</button>
            </form>

            {/* Display fetched snippets */}
            <ul>
                {snippets.map((snippet, index) => (
                    <li key={index}>{snippet.title || JSON.stringify(snippet)}</li>
                ))}
            </ul>
        </div>
    );
}

export default Snippets;
