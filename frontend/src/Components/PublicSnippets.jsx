import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function SnippetView() {
  const { snippetId } = useParams();
  const [snippet, setSnippet] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/get_public_snippet/${snippetId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Snippet not found");
        return res.json();
      })
      .then((data) => {
        if (!data.snippet) throw new Error("Snippet not found");

        // Parse tags: "{example,test}" -> ["example", "test"]
        const parsedTags = typeof data.snippet.tags === "string"
          ? data.snippet.tags.replace(/[{}"]/g, "").split(",").filter(Boolean)
          : data.snippet.tags || [];

        setSnippet({ ...data.snippet, tags: parsedTags });
      })
      .catch((err) => setError(err.message));
  }, [snippetId]);

  if (error) return <div className="text-red-500 p-4">⚠️ {error}</div>;
  if (!snippet) return <div className="text-gray-500 p-4">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white shadow-md rounded-2xl p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">{snippet.title}</h1>

      <div className="text-sm text-gray-500">
        <span className="mr-4">
          Language: <strong>{snippet.language}</strong>
        </span>
        <span>Created: {new Date(snippet.created_at).toLocaleString()}</span>
      </div>

      {snippet.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {snippet.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-1 text-xs bg-gray-200 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{snippet.content}</code>
      </pre>

      {snippet.favourite && (
        <div className="text-sm text-yellow-500">⭐ Marked as Favourite</div>
      )}
    </div>
  );
}

export default SnippetView;
