import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle } from "react-icons/fa";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './css/Snippets.css';
import Alert from './services/Alert';
import { getLanguage, getLanguageIcon, getLanguageDisplayName, copyToClipboard } from './services/languageUtils';

// Demo data - predefined snippets to showcase the app
const demoSnippets = [
  {
    id: 1,
    title: "API Authentication Helper",
    content: `const authenticateUser = async (token) => {
  try {
    const response = await fetch('/api/verify', {
      method: 'POST',
      headers: { 
        'Authorization': \`Bearer \${token}\`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  } catch (error) {
    console.error('Auth failed:', error);
  }
};`,
    language: "javascript",
    tags: ["authentication", "api", "jwt"],
    favourite: true,
    is_public: true,
    created_at: "2025-01-15T10:30:00Z"
  },
  {
    id: 2,
    title: "Python List Comprehension Examples",
    content: `# Basic list comprehension
squares = [x**2 for x in range(10)]

# With condition
even_squares = [x**2 for x in range(10) if x % 2 == 0]

# Nested comprehension
matrix = [[j for j in range(3)] for i in range(3)]

# Dictionary comprehension
word_lengths = {word: len(word) for word in ['hello', 'world', 'python']}

print(squares)
print(even_squares)
print(matrix)
print(word_lengths)`,
    language: "python",
    tags: ["comprehension", "python", "functional"],
    favourite: false,
    is_public: true,
    created_at: "2025-01-14T09:15:00Z"
  },
  {
    id: 3,
    title: "CSS Flexbox Center Layout",
    content: `.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.centered-item {
  background: #f0f0f0;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Alternative with flex-direction column */
.vertical-center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}`,
    language: "css",
    tags: ["flexbox", "layout", "centering"],
    favourite: true,
    is_public: false,
    created_at: "2025-01-13T16:45:00Z"
  },
  {
    id: 4,
    title: "React Custom Hook - useLocalStorage",
    content: `import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;`,
    language: "javascript",
    tags: ["react", "hooks", "localstorage"],
    favourite: false,
    is_public: true,
    created_at: "2025-01-12T14:20:00Z"
  },
  {
    id: 5,
    title: "SQL Query - Join Multiple Tables",
    content: `SELECT 
    u.username,
    u.email,
    p.title as post_title,
    p.content,
    c.comment_text,
    c.created_at as comment_date
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
LEFT JOIN comments c ON p.id = c.post_id
WHERE u.active = true
    AND p.published = true
ORDER BY p.created_at DESC, c.created_at ASC
LIMIT 50;

-- Alternative with subquery
SELECT 
    username,
    email,
    (SELECT COUNT(*) FROM posts WHERE user_id = u.id) as post_count
FROM users u
WHERE u.created_at > '2024-01-01';`,
    language: "sql",
    tags: ["database", "joins", "query"],
    favourite: true,
    is_public: true,
    created_at: "2025-01-11T11:30:00Z"
  },
  {
    id: 6,
    title: "Java Stream API Examples",
    content: `import java.util.*;
import java.util.stream.*;

public class StreamExamples {
    public static void main(String[] args) {
        List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "David");
        
        // Filter and collect
        List<String> filteredNames = names.stream()
            .filter(name -> name.length() > 4)
            .collect(Collectors.toList());
        
        // Map and reduce
        Optional<String> concatenated = names.stream()
            .map(String::toUpperCase)
            .reduce((a, b) -> a + ", " + b);
        
        // Group by length
        Map<Integer, List<String>> groupedByLength = names.stream()
            .collect(Collectors.groupingBy(String::length));
        
        System.out.println(filteredNames);
        System.out.println(concatenated.orElse(""));
        System.out.println(groupedByLength);
    }
}`,
    language: "java",
    tags: ["java", "streams", "functional"],
    favourite: false,
    is_public: true,
    created_at: "2025-01-10T08:45:00Z"
  }
];

export default function Demo() {
  const [alertMessage, setAlertMessage] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc');

  // Function to sort snippets: favorites first, then by date according to sortOrder
  const sortSnippets = (snippets) => {
    return [...snippets].sort((a, b) => {
      // First sort by favorite status (favorites first)
      if (a.favourite && !b.favourite) return -1;
      if (!a.favourite && b.favourite) return 1;
      
      // Then sort by date according to sortOrder
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      
      if (sortOrder === 'desc') {
        return dateB - dateA; // Newest first
      } else {
        return dateA - dateB; // Oldest first
      }
    });
  };

  // Function to toggle sort order
  const toggleSortOrder = () => {
    const newSortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newSortOrder);
  };

  // Function to get all unique languages from snippets
  const getAllLanguages = (snippets) => {
    const languages = snippets
      .map(s => s.language)
      .filter(lang => lang && lang.trim() !== '')
      .map(lang => lang.toLowerCase());
    return [...new Set(languages)].sort();
  };

  // Function to get all unique tags from snippets
  const getAllTags = (snippets) => {
    const tags = snippets
      .flatMap(s => {
        if (Array.isArray(s.tags)) {
          return s.tags;
        }
        return [];
      })
      .filter(tag => tag && tag.trim() !== '')
      .map(tag => tag.toLowerCase());
    return [...new Set(tags)].sort();
  };

  // Function to filter snippets based on search query
  const getSearchFilteredSnippets = (snippets) => {
    if (!searchQuery.trim()) return snippets;
    
    const query = searchQuery.toLowerCase();
    return snippets.filter(snippet => {
      // Search in title
      const titleMatch = snippet.title?.toLowerCase().includes(query);
      
      // Search in content
      const contentMatch = snippet.content?.toLowerCase().includes(query);
      
      // Search in language
      const languageMatch = snippet.language?.toLowerCase().includes(query);
      
      // Search in tags
      const tagMatch = snippet.tags.some(tag => tag.toLowerCase().includes(query));
      
      return titleMatch || contentMatch || languageMatch || tagMatch;
    });
  };

  // Function to filter snippets based on selected languages and tags
  const getFilteredSnippets = (snippets) => {
    return snippets.filter(snippet => {
      if (showFavoritesOnly && !snippet.favourite) {
        return false;
      }

      const languageMatch = selectedLanguages.length === 0 || 
        selectedLanguages.includes(snippet.language?.toLowerCase());
      
      const tagMatch = selectedTags.length === 0 || 
        selectedTags.some(selectedTag => 
          snippet.tags.some(snippetTag => snippetTag.toLowerCase() === selectedTag)
        );
      
      return languageMatch && tagMatch;
    });
  };

  // Combined filter function that applies both search and filters
  const getFullyFilteredSnippets = (snippets) => {
    const searchFiltered = getSearchFilteredSnippets(snippets);
    return getFilteredSnippets(searchFiltered);
  };

  // Handler for language filter changes
  const handleLanguageChange = (language, isChecked) => {
    if (isChecked) {
      setSelectedLanguages([...selectedLanguages, language]);
    } else {
      setSelectedLanguages(selectedLanguages.filter(lang => lang !== language));
    }
  };

  // Handler for tag filter changes
  const handleTagChange = (tag, isChecked) => {
    if (isChecked) {
      setSelectedTags([...selectedTags, tag]);
    } else {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    }
  };

  // Handler for search input changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const redirectToSnippet = (snippetId) => {
    setAlertMessage("This is a demo - view functionality disabled. Sign up to create and view your own snippets!");
  };

  const demoAction = (actionName) => {
    setAlertMessage(`This is a demo - ${actionName} functionality disabled. Sign up to access all features!`);
  };

  const sortedSnippets = sortSnippets(demoSnippets);
  const filteredSnippets = getFullyFilteredSnippets(sortedSnippets);

  return (
    <div className="app">
      {alertMessage && <Alert message={alertMessage} onClose={() => setAlertMessage("")} />}
      <aside className={`sidebar${sidebarCollapsed ? " collapsed" : ""}`}>
        <button
          className="collapse-sidebar-btn"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
          <span className="collapse-icon">{sidebarCollapsed ? "→" : "←"}</span>
        </button>
        <div className="sidebar-title">Demo Snippets</div>

        <div className="sidebar-nav">
          <div 
            className={`nav-item ${!showFavoritesOnly ? 'active' : ''}`}
            onClick={() => setShowFavoritesOnly(false)}
            style={{ cursor: 'pointer' }}
          >
            <span className="nav-icon">≡</span> All Snippets
          </div>
          <div 
            className={`nav-item ${showFavoritesOnly ? 'active' : ''}`}
            onClick={() => setShowFavoritesOnly(true)}
            style={{ cursor: 'pointer' }}
          >
            <span className="nav-icon">★</span> Favorites
          </div>
        </div>

        <div className="filters">
          <p className="filter-heading">LANGUAGE</p>
          <div className="filter-section">
            {getAllLanguages(demoSnippets).map(language => (
              <label key={language} className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={selectedLanguages.includes(language)}
                  onChange={(e) => handleLanguageChange(language, e.target.checked)}
                /> 
                {getLanguageDisplayName(language)}
              </label>
            ))}
          </div>

          <p className="filter-heading">TAGS</p>
          <div className="filter-section">
            {getAllTags(demoSnippets).map(tag => (
              <label key={tag} className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={selectedTags.includes(tag)}
                  onChange={(e) => handleTagChange(tag, e.target.checked)}
                /> 
                {tag}
              </label>
            ))}
          </div>
        </div>

        <div className="sidebar-bottom">
          <Link to="/" className="nav-item settings-nav">
            <span className="nav-icon" role="img" aria-label="Back to Home">🏠</span> Back to Home
          </Link>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="search-container">
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search demo snippets..." 
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <button className="new-snippet-button" onClick={() => demoAction("create snippet")}>
            New Snippet (Demo)
          </button>
          <span 
            className="date-created"
            onClick={toggleSortOrder}
            style={{ cursor: 'pointer' }}
          >
            Date Created
          </span>
          <span 
            className={`sort-arrow ${sortOrder === 'desc' ? 'desc-active' : 'asc-active'}`}
            onClick={toggleSortOrder}
            style={{ cursor: 'pointer' }}
          >
            {sortOrder === 'desc' ? '▼' : '▲'}
          </span>
          <div style={{ flex: 1 }} />
          <div className="profile-wrapper" style={{ position: 'relative' }}>
            <div className="demo-badge">DEMO MODE</div>
          </div>
        </header>

        <section className="snippet-grid">
          {filteredSnippets.length > 0 ? (
            filteredSnippets.map((s) => (
              <div className="snippet-card" key={s.id}>
                <div className="card-header">
                  <h4 
                    className="snippet-title"
                    onClick={() => redirectToSnippet(s.id)}
                    style={{ cursor: 'pointer' }}
                    title="Click to view snippet (Demo mode)"
                  >
                    {s.favourite && <span className="favorite-star">⭐ </span>}
                    {s.title}
                  </h4>
                  <div className="lang-and-date-container">
                    <span className="lang-tag">{getLanguageIcon(s.language)} {s.language ? s.language.toUpperCase() : ''}</span>
                    <span className="card-date">
                      {s.created_at
                        ? new Date(s.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'No date'}
                    </span>
                    <span className="card-tags">
                      {s.tags.join(", ")}
                    </span>
                  </div>
                </div>
                <SyntaxHighlighter
                  language={getLanguage(s.language)}
                  style={prism}
                  customStyle={{
                    borderRadius: '6px',
                    maxHeight: '200px',
                    overflow: 'auto',
                    margin: 0,
                    fontSize: '14px',
                    minHeight: '150px',
                    backgroundColor: 'hsl(0, 0%, 95%)' // Very light grey, less bright
                  }}
                >
                  {s.content}
                </SyntaxHighlighter>
                <div className="card-footer">
                  <div className="card-actions">
                    <span className="action-icon" title="Copy to clipboard" onClick={() => copyToClipboard(s.content, setAlertMessage)}>📋</span>
                    {s.is_public && (
                      <span className="action-icon" title="Link (Demo)" onClick={() => demoAction("share link")}>🔗</span>
                    )}
                    <span className="action-icon" title="Edit (Demo)" onClick={() => demoAction("edit")}>✏️</span>
                    <span className="action-icon" title="Delete (Demo)" onClick={() => demoAction("delete")}>🗑️</span>
                    <span 
                      className="action-icon" 
                      title={s.favourite ? "Remove from favorites (Demo)" : "Add to favorites (Demo)"}
                      onClick={() => demoAction("toggle favorite")}
                      style={{ cursor: 'pointer' }}
                    >
                      {s.favourite ? '❤️' : '🤍'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-snippets">
              {searchQuery ? `No demo snippets match "${searchQuery}"` : 
               "No demo snippets match the selected filters."}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
