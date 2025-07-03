import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function CreateSnippet() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    language: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!formData.content.trim()) {
      setError('Code content is required');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('You must be logged in to create a snippet');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8000/create_snippet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title || 'Untitled Snippet',
          content: formData.content,
          language: formData.language || '',
          favourite: false,
          tags: []
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create snippet');
      }

      const result = await response.json();
      
      if (result.success) {
        // Success! Navigate back to snippets page
        navigate('/snippets');
      } else {
        setError(result.error || 'Failed to create snippet');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while creating the snippet');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/snippets');
  };

  return (
    <div className="create-snippet-page">
      <header className="create-snippet-header">
        <div className="header-left">
          <Link to="/snippets" className="back-button">
            ← Back to Snippets
          </Link>
          <h1>Create New Snippet</h1>
        </div>
        <div className="header-actions">
          <button type="button" className="cancel-button" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" form="snippet-form" className="save-button" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </header>

      <main className="create-snippet-main">
        {error && (
          <div className="error-message" style={{ color: 'red', marginBottom: '1rem', padding: '1rem', backgroundColor: '#ffebee', borderRadius: '4px' }}>
            {error}
          </div>
        )}
        
        <form id="snippet-form" className="snippet-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="Enter snippet title..."
                className="form-input"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="language">Language</label>
              <input
                type="text"
                id="language"
                name="language"
                placeholder="Enter programming language..."
                className="form-input"
                value={formData.language}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group content-group">
            <label htmlFor="content">Code Content</label>
            <textarea
              id="content"
              name="content"
              placeholder="Paste or type your code here..."
              className="form-textarea"
              rows="20"
              value={formData.content}
              onChange={handleInputChange}
              required
            ></textarea>
          </div>
        </form>
      </main>
    </div>
  );
}
