import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { FaUserCircle } from "react-icons/fa";
import './css/Snippets.css';
import Alert from './Alert';

export default function Snippets() {
  const token = localStorage.getItem("authToken");

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
  
  const SnippetModal = ({isOpen, onClose, onSubmit, snippet = null}) => {
    const isEditing = snippet !== null;
    
    const [title, setTitle] = useState(snippet?.title || "");
    const [content, setContent] = useState(snippet?.content || "");
    const [language, setLanguage] = useState(snippet?.language || "");
    const [tag1, setTag1] = useState("");
    const [tag2, setTag2] = useState("");
    const [tag3, setTag3] = useState("");
    const [favourite, setFavourite] = useState(snippet?.favourite || false);
    const [isPublic, setPublic] = useState(snippet?.is_public || false);

    useEffect(() => {
      if (isEditing && snippet) {
        let tags = [];
        if (Array.isArray(snippet.tags)) {
          tags = snippet.tags;
        } else if (typeof snippet.tags === 'string') {
          try {
            const parsed = JSON.parse(snippet.tags);
            tags = Array.isArray(parsed) ? parsed : [snippet.tags];
          } catch {
            tags = [snippet.tags];
          }
        }
        
        setTag1(tags[0] || "");
        setTag2(tags[1] || "");
        setTag3(tags[2] || "");
      }
    }, [isEditing, snippet]);

    const submitTriggered = (e) => {
      e.preventDefault();

      const tagsArray = [tag1, tag2, tag3].filter(tag => tag.trim() !== "");

      if (isEditing) {
        onSubmit({ id: snippet.id,title, content, language, tags: tagsArray, favourite, isPublic });
        onClose();
      } else {
        onSubmit({ title, content, language, tags: tagsArray, favourite, isPublic });
        setTitle("");
        setContent("");
        setLanguage("");
        setTag1("");
        setTag2("");
        setTag3("");
        setFavourite(false);
        setPublic(false);
        onClose();
      }
    };

    if (!isOpen) return null;

    return(
      <div className="popup-overlay">
        <div className="popup-container">
          <div className="popup-header">
            <h3>{isEditing ? "Edit snippet" : "Create new snippet"}</h3>
          </div>
          <div className="popup-content">
            <form id="snippet-form" onSubmit={submitTriggered}>
              <div className="form-group">
                <label>Title</label>
                <input
                  className="form-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={20}
                  required
                />
                <small className="char-count">{20 - title.length} characters remaining</small>
              </div>

              <div className="form-group">
                <label>Language</label>
                <select
                  className="form-input"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  required
                >
                  <option value="">Select a language</option>
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                </select>
              </div>

              <div className="form-group">
                <label>Content</label>
                <textarea 
                  className="form-input form-textarea"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows="5"
                />
              </div>

              <div className="form-group">
                <label>Tags (optional)</label>
                <div className="tag-inputs">
                  <input
                    className="form-input"
                    type="text"
                    value={tag1}
                    onChange={(e) => setTag1(e.target.value)}
                    maxLength={10}
                    placeholder="e.g. api, regex" 
                  />
                  <input
                    className="form-input"
                    type="text"
                    value={tag2}
                    onChange={(e) => setTag2(e.target.value)}
                    maxLength={10}
                    placeholder="e.g. api, regex" 
                  />
                  <input
                    className="form-input"
                    type="text"
                    value={tag3}
                    onChange={(e) => setTag3(e.target.value)}
                    maxLength={10}
                    placeholder="e.g. api, regex" 
                  />
                </div>
              </div>

              <div className="checkbox-row">
                {!isEditing && (
                  <div className="form-group">
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={favourite}
                        onChange={(e) => setFavourite(e.target.checked)}
                      />
                      Add to favourites
                    </label>
                  </div>
                )}

                <div className="form-group">
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setPublic(e.target.checked)}
                    />
                    Make public
                  </label>
                </div>
              </div>
            </form>
          </div>
          <div className="popup-actions">
            <button className="btn btn-secondary" type="button" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" type="submit" form="snippet-form">
              {isEditing ? "Update Snippet" : "Create Snippet"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const snippetSubmit = async (snippetData) => {
    try {
      const response = await fetch("http://localhost:8000/create_snippet", {
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
      
      const data = await response.json();
      
      if (data.success) {
        setAlertMessage("Snippet created successfully!");
        const resp = await fetch("http://localhost:8000/get_snippets", {
          headers: { Authorization: `Bearer ${token}` }
        });
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
      const response = await fetch(`http://localhost:8000/edit_snippet/${snippetData.id}`, {
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
      
      const data = await response.json();
      
      if (data.success) {
        setAlertMessage("Snippet updated successfully!");
        const resp = await fetch("http://localhost:8000/get_snippets", {
          headers: { Authorization: `Bearer ${token}` }
        });
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

  // Function to sort snippets: favorites first, then by date descending
  const sortSnippets = (snippets) => {
    return [...snippets].sort((a, b) => {
      // First sort by favorite status (favorites first)
      if (a.favourite && !b.favourite) return -1;
      if (!a.favourite && b.favourite) return 1;
      
      // Then sort by date descending (newest first)
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return dateB - dateA;
    });
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
        const resp = await fetch("http://localhost:8000/get_snippets", {
          headers: { Authorization: `Bearer ${token}` }
        });
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

  const deleteSnippet = async (snippetId) => {
    try {
      const response = await fetch(`http://localhost:8000/delete_snippet/${snippetId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
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
          <div className="nav-item active"><span className="nav-icon">≡</span> All Snippets</div>
          <div className="nav-item"><span className="nav-icon">★</span> Favorites</div>
          <div className="nav-item"><span className="nav-icon">⏱</span> Recently Edited</div>
          <div className="nav-item"><span className="nav-icon">🗑</span> Trash</div>
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
          <span className="date-created">Date Created</span>
          <span className="sort-arrow">▲▼</span>
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
                  <h4>
                    {s.favourite && <span className="favorite-star">⭐ </span>}
                    {s.title}
                  </h4>
                  <div className="lang-and-date-container">
                    <span className="lang-tag">{s.language ? s.language.toUpperCase() : ''}</span>
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
                <pre className="card-code">
                  <code>{s.content}</code>
                </pre>
                <div className="card-footer">
                  <div className="card-actions">
                    <span className="action-icon" title="Copy to clipboard" onClick={() => copyToClipboard(s.content)}>📋</span>
                    {s.is_public && (
                      <span className="action-icon" title="Link">🔗</span>
                    )}
                    <span className="action-icon" title="Edit" onClick={() => editSnippet(s)}>✏️</span>
                    <span className="action-icon" title="Delete" onClick={() => deleteSnippet(s.id)}>🗑️</span>
                    <span className="action-icon" title="Favourite">{s.favourite ? '❤️' : '🤍'}</span>
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