/**
 * SnippetModal Component
 * 
 * A reusable modal component for creating and editing code snippets in the application.
 * This component provides a form interface that allows users to input snippet details including
 * title, programming language, content, tags, and visibility settings.
 * 
 * Key Features:
 * - Supports both creating new snippets and editing existing ones with form validation
 * - Handles tags, language selection, visibility settings, and favorites with automatic form management
 */

import { useState, useEffect } from 'react';

const SnippetModal = ({isOpen, onClose, onSubmit, snippet = null}) => {
  const isEditing = snippet !== null;
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("");
  const [tag1, setTag1] = useState("");
  const [tag2, setTag2] = useState("");
  const [tag3, setTag3] = useState("");
  const [favourite, setFavourite] = useState(false);
  const [isPublic, setPublic] = useState(false);

  useEffect(() => {
    if (isEditing && snippet) {
      setTitle(snippet.title || "");
      setContent(snippet.content || "");
      setLanguage(snippet.language || "");
      setFavourite(snippet.favourite || false);
      setPublic(snippet.is_public || false);
      
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
    } else {
      setTitle("");
      setContent("");
      setLanguage("");
      setTag1("");
      setTag2("");
      setTag3("");
      setFavourite(false);
      setPublic(false);
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
                rows="12"
                style={{ minHeight: '300px', resize: 'vertical' }}
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

export default SnippetModal;
