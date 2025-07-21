import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { FaUserCircle } from "react-icons/fa";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './css/Snippets.css';
import Alert from './services/Alert';
import SnippetModal from './SnippetModal';
import pythonIcon from '../assets/python.svg'; 
import javascriptIcon from '../assets/javascript.svg';
import htmlIcon from '../assets/html.svg';
import cssIcon from '../assets/css.svg';

export default function Snippets() {
  const token = localStorage.getItem("authToken");

  // Handle JWT token expiry
  const handleTokenExpiry = () => {
    console.log('Token expired, clearing auth data and redirecting to login');
    localStorage.removeItem('authToken');
    localStorage.removeItem('theme');
    window.location.href = '/';
  };

  const [snippets, setSnippets] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc'); 
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

  const getLanguageIcon = (language) => {
    const iconMap = {
      "python": <img src={pythonIcon} alt="Python" className="language-icon" />,
      "javascript": <img src={javascriptIcon} alt="JavaScript" className="language-icon" />,
      "html": <img src={htmlIcon} alt="HTML" className="language-icon" />,
      "css": <img src={cssIcon} alt="CSS" className="language-icon" />
    };
    return iconMap[language?.toLowerCase()] || <span className="text-icon">TXT</span>;
  };

  const snippetSubmit = async (snippetData) => {
    try {
      const response = await fetch(`${API_URL}/create_snippet`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          title: snippetData.title,
          content: snippetData.content,
          language: snippetData.language,
          tags: snippetData.tags,
          favourite: snippetData.favourite,
          is_public: snippetData.isPublic
        })
      });
      
      // Check for token expiry
      if (response.status === 401) {
        handleTokenExpiry();
        return;
      }
      
      const data = await response.json();
      
      if (response.status === 429) {
        // Handle rate limiting
        const retryAfter = data.detail?.retry_after || 60;
        setAlertMessage(`Rate limit exceeded! Please wait ${retryAfter} seconds before creating another snippet.`);
        return;
      }
      
      if (data.success) {
        setAlertMessage("Snippet created successfully!");
        const resp = await fetch(`${API_URL}/get_snippets`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Check for token expiry
        if (resp.status === 401) {
          handleTokenExpiry();
          return;
        }
        
        if (resp.ok) {
          const refreshData = await resp.json();
          if (refreshData.success && Array.isArray(refreshData.snippets)) {
            setSnippets(sortSnippets(refreshData.snippets));
          }
        }
      } else {
        setAlertMessage("Failed to create snippet.");
      }
    } catch (error) {
      console.error("Error:", error);
      setAlertMessage("Error creating snippet. See console.");
    }
  };

  const editSnippetSubmit = async (snippetData) => {
    try {
      const response = await fetch(`${API_URL}/edit_snippet/${snippetData.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          title: snippetData.title,
          content: snippetData.content,
          language: snippetData.language,
          tags: snippetData.tags,
          is_public: snippetData.isPublic
        })
      });
      
      // Check for token expiry
      if (response.status === 401) {
        handleTokenExpiry();
        return;
      }
      
      const data = await response.json();
      
      if (response.status === 429) {
        // Handle rate limiting
        const retryAfter = data.detail?.retry_after || 60;
        setAlertMessage(`Rate limit exceeded! Please wait ${retryAfter} seconds before editing another snippet.`);
        return;
      }
      
      if (data.success) {
        setAlertMessage("Snippet updated successfully!");
        const resp = await fetch(`${API_URL}/get_snippets`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Check for token expiry
        if (resp.status === 401) {
          handleTokenExpiry();
          return;
        }
        
        if (resp.ok) {
          const refreshData = await resp.json();
          if (refreshData.success && Array.isArray(refreshData.snippets)) {
            setSnippets(sortSnippets(refreshData.snippets));
          }
        }
      } else {
        setAlertMessage("Failed to update snippet.");
      }
    } catch (error) {
      console.error("Error:", error);
      setAlertMessage("Error updating snippet. See console.");
    }
  };

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
    // Re-sort existing snippets with new order
    setSnippets(prev => sortSnippets(prev));
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
        } else if (typeof s.tags === 'string') {
          try {
            const parsed = JSON.parse(s.tags);
            return Array.isArray(parsed) ? parsed : [s.tags];
          } catch {
            return [s.tags];
          }
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
      let tagMatch = false;
      if (Array.isArray(snippet.tags)) {
        tagMatch = snippet.tags.some(tag => tag.toLowerCase().includes(query));
      } else if (typeof snippet.tags === 'string') {
        try {
          const parsed = JSON.parse(snippet.tags);
          if (Array.isArray(parsed)) {
            tagMatch = parsed.some(tag => tag.toLowerCase().includes(query));
          } else {
            tagMatch = snippet.tags.toLowerCase().includes(query);
          }
        } catch {
          tagMatch = snippet.tags.toLowerCase().includes(query);
        }
      }
      
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
      
      // Handle different tag formats
      let snippetTags = [];
      if (Array.isArray(snippet.tags)) {
        snippetTags = snippet.tags;
      } else if (typeof snippet.tags === 'string') {
        try {
          const parsed = JSON.parse(snippet.tags);
          snippetTags = Array.isArray(parsed) ? parsed : [snippet.tags];
        } catch {
          snippetTags = [snippet.tags];
        }
      }
      
      const tagMatch = selectedTags.length === 0 || 
        selectedTags.some(selectedTag => 
          snippetTags.some(snippetTag => snippetTag.toLowerCase() === selectedTag)
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

  const editSnippet = (snippet) => {
    setEditingSnippet(snippet);
    setEditOpen(true);
  };

  useEffect(() => {
    if (!token) {
      setAlertMessage("You must be logged in to view snippets.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const resp = await fetch(`${API_URL}/get_snippets`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Check for token expiry
        if (resp.status === 401) {
          handleTokenExpiry();
          return;
        }
        
        if (resp.status === 429) {
          const data = await resp.json();
          const retryAfter = data.detail?.retry_after || 60;
          setAlertMessage(`Rate limit exceeded! Please wait ${retryAfter} seconds before refreshing.`);
          setLoading(false);
          return;
        }
        
        if (!resp.ok) throw new Error(`Status ${resp.status}`);
        const data = await resp.json();
        console.log("API response:", data);

        if (data.success && Array.isArray(data.snippets)) {
          // Sort snippets after fetching
          setSnippets(sortSnippets(data.snippets));
        } else {
          console.warn("Unexpected payload shape:", data);
          setSnippets([]);
        }
      } catch (err) {
        console.error("Error fetching snippets:", err);
        setAlertMessage("Error fetching snippets. See console.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (loading) return <div className="loading">Loading snippets…</div>;

  const copyToClipboard = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      setAlertMessage("Snippet copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      setAlertMessage("Failed to copy to clipboard.");
    }
  };

  const grabLink = async (snippetId) => {
    try {
      const publicLink = `${window.location.origin}/public_snippet/${snippetId}`;
      
      await navigator.clipboard.writeText(publicLink);
      setAlertMessage("Public link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy link to clipboard:", error);
      setAlertMessage("Failed to copy link to clipboard.");
    }
  };

  const redirectToSnippet = (snippetId) => {
    window.open(`/public_snippet/${snippetId}`, '_blank');
  };

  const deleteSnippet = async (snippetId) => {
    try {
      const response = await fetch(`${API_URL}/delete_snippet/${snippetId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Check for token expiry
      if (response.status === 401) {
        handleTokenExpiry();
        return;
      }
      
      const data = await response.json();
      
      if (response.status === 429) {
        // Handle rate limiting
        const retryAfter = data.detail?.retry_after || 60;
        setAlertMessage(`Rate limit exceeded! Please wait ${retryAfter} seconds before deleting another snippet.`);
        return;
      }
      
      if (data.success) {
        setSnippets(snippets => sortSnippets(snippets.filter(s => s.id !== snippetId)));
        setAlertMessage("Snippet deleted!");
      } else {
        setAlertMessage(data.error || "Failed to delete snippet.");
      }
    } catch (error) {
      console.error("Error deleting snippet:", error);
      setAlertMessage("Error deleting snippet.");
    }
  };

  const toggleFavorite = async (snippetId) => {
    const snippet = snippets.find(s => s.id === snippetId);
    if (!snippet) return;

    try {
      const response = await fetch(`${API_URL}/edit_snippet/${snippetId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          title: snippet.title,
          content: snippet.content,
          language: snippet.language,
          tags: snippet.tags,
          is_public: snippet.is_public,
          favourite: !snippet.favourite
        })
      });
      
      // Check for token expiry
      if (response.status === 401) {
        handleTokenExpiry();
        return;
      }
      
      const data = await response.json();
      
      if (response.status === 429) {
        // Handle rate limiting
        const retryAfter = data.detail?.retry_after || 60;
        setAlertMessage(`Rate limit exceeded! Please wait ${retryAfter} seconds before updating favorites.`);
        return;
      }
      
      if (data.success) {
        setSnippets(prev => sortSnippets(prev.map(s => 
          s.id === snippetId ? { ...s, favourite: !s.favourite } : s
        )));
        setAlertMessage(snippet.favourite ? "Removed from favorites!" : "Added to favorites!");
      } else {
        setAlertMessage("Failed to update favorite status.");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      setAlertMessage("Error updating favorite status.");
    }
  };

  const filteredSnippets = getFullyFilteredSnippets(snippets);

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
        <div className="sidebar-title">All Snippets</div>

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
            {getAllLanguages(snippets).map(language => (
              <label key={language} className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={selectedLanguages.includes(language)}
                  onChange={(e) => handleLanguageChange(language, e.target.checked)}
                /> 
                {language.charAt(0).toUpperCase() + language.slice(1)}
              </label>
            ))}
          </div>

          <p className="filter-heading">TAGS</p>
          <div className="filter-section">
            {getAllTags(snippets).map(tag => (
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
          <Link to="/settings" className="nav-item settings-nav">
            <span className="nav-icon" role="img" aria-label="Settings">⚙️</span> Settings
          </Link>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="search-container">
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search snippets..." 
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <button className="new-snippet-button" onClick={() => setCreateOpen(true)}>New Snippet</button>
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
            <div
              className="profile-icon"
              onClick={() => setProfileMenu(!profileMenu)}
              onBlur={() => setTimeout(() => setProfileMenu(false), 200)}
              style={{ cursor: 'pointer' }}>
              <FaUserCircle size={32} />
            </div>
            {profileMenu && (
              <div className="profile-menu">
                <Link to="/settings" className="profile-menu-item">Account Settings</Link>
                <button
                  className="profile-menu-item"
                  onClick={() => {
                    localStorage.removeItem('authToken');
                    setAlertMessage("You have been logged out.");
                  }}>
                  Logout
                </button>
              </div>
            )}
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
                    title="Click to view snippet"
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
                      {(() => {
                        if (Array.isArray(s.tags)) {
                          return s.tags.join(", ");
                        } else if (typeof s.tags === 'string') {
                          try {
                            const parsed = JSON.parse(s.tags);
                            return Array.isArray(parsed) ? parsed.join(", ") : s.tags;
                          } catch {
                            return s.tags;
                          }
                        }
                        return '';
                      })()}
                    </span>
                  </div>
                </div>
                <SyntaxHighlighter
                  language={getLanguage(s.language)}
                  style={tomorrow}
                  customStyle={{
                    borderRadius: '6px',
                    maxHeight: '200px',
                    overflow: 'auto',
                    margin: 0,
                    minHeight: '150px'
                  }}
                >
                  {s.content}
                </SyntaxHighlighter>
                <div className="card-footer">
                  <div className="card-actions">
                    <span className="action-icon" title="Copy to clipboard" onClick={() => copyToClipboard(s.content)}>📋</span>
                    {s.is_public && (
                      <span className="action-icon" title="Link" onClick={() => grabLink(s.id)}>🔗</span>
                    )}
                    <span className="action-icon" title="Edit" onClick={() => editSnippet(s)}>✏️</span>
                    <span className="action-icon" title="Delete" onClick={() => deleteSnippet(s.id)}>🗑️</span>
                    <span 
                      className="action-icon" 
                      title={s.favourite ? "Remove from favorites" : "Add to favorites"}
                      onClick={() => toggleFavorite(s.id)}
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
              {snippets.length === 0 ? "No snippets found." : 
               searchQuery ? `No snippets match "${searchQuery}"` : 
               "No snippets match the selected filters."}
            </div>
          )}
        </section>
      </main>
      
      <SnippetModal
        isOpen={isCreateOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={snippetSubmit}
      />
      
      <SnippetModal
        isOpen={isEditOpen}
        onClose={() => {
          setEditOpen(false);
          setEditingSnippet(null);
        }}
        onSubmit={editSnippetSubmit}
        snippet={editingSnippet}
      />
    </div>
  );
}