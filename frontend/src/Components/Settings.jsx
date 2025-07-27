import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from './services/Alert';
import ThemeContext from './services/ThemeContext';
import handleTokenExpiry from './services/utils';
import './css/settings.css';

function Settings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [aiUse, setAiUse] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [rateLimitTimer, setRateLimitTimer] = useState(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  // Theme context
  const { isDark, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/", { replace: true });
      return;
    }
    
    // Load current AI usage preference
    loadAIUsage();
    
    // Cleanup timer on unmount
    return () => {
      if (rateLimitTimer) {
        clearInterval(rateLimitTimer);
      }
    };
  }, [navigate]);

  // Helper function to handle rate limiting with countdown
  const handleRateLimit = (retryAfter, action) => {
    let timeLeft = retryAfter;
    const actionText = action.toLowerCase();
    setIsRateLimited(true);
    setAlertMessage(`⚠️ Slow down! You're ${actionText} too frequently. Please wait ${timeLeft} seconds before trying again.`);
    
    if (rateLimitTimer) clearInterval(rateLimitTimer);
    
    const timer = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        setAlertMessage("");
        setIsRateLimited(false);
        clearInterval(timer);
        setRateLimitTimer(null);
      } else {
        setAlertMessage(`⚠️ Please wait ${timeLeft} more second${timeLeft !== 1 ? 's' : ''} before ${actionText} again.`);
      }
    }, 1000);
    
    setRateLimitTimer(timer);
  };

  // Helper function to clear any existing timer and set success message
  const setSuccessMessage = (message) => {
    if (rateLimitTimer) {
      clearInterval(rateLimitTimer);
      setRateLimitTimer(null);
    }
    setIsRateLimited(false);
    setAlertMessage(message);
  };

  const loadAIUsage = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_URL}/get_ai_use`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        handleTokenExpiry();
        return;
      }

      if (response.ok) {
        const result = await response.json();
        setAiUse(result.ai_use);
      }
    } catch (error) {
      console.error("Failed to load AI usage preference:", error);
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setAlertMessage("Email cannot be empty");
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_URL}/change_email`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ new_email: email }),
      });

      const result = await response.json();

      if (response.status === 401) {
        handleTokenExpiry();
        return;
      }

      if (response.status === 429) {
        const retryAfter = result.detail?.retry_after || 60;
        handleRateLimit(retryAfter, "updating your email");
        return;
      }

      if (response.ok) {
        setSuccessMessage("✅ Email updated successfully!");
        setEmail("");
      } else {
        setAlertMessage(result.detail || "Failed to update email. Please try again.");
      }
    } catch (error) {
      console.error("Email update error:", error);
      setAlertMessage("Failed to update email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setAlertMessage("New passwords don't match");
      return;
    }
    
    if (newPassword.length < 6) {
      setAlertMessage("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_URL}/change_password`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          current_password: currentPassword, 
          new_password: newPassword 
        }),
      });

      const result = await response.json();

      if (response.status === 401) {
        handleTokenExpiry();
        return;
      }

      if (response.status === 429) {
        const retryAfter = result.detail?.retry_after || 60;
        handleRateLimit(retryAfter, "updating your password");
        return;
      }

      if (response.ok) {
        setSuccessMessage("✅ Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setAlertMessage(result.detail || "Failed to update password. Please try again.");
      }
    } catch (error) {
      console.error("Password update error:", error);
      setAlertMessage("Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTheme = async () => {
    const newDarkMode = !isDark;
    
    // Update UI immediately
    toggleTheme();
    
    // Save to backend
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_URL}/change_dark_mode`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dark_mode: newDarkMode }),
      });

      const result = await response.json();

      if (response.status === 401) {
        handleTokenExpiry();
        return;
      }

      if (response.status === 429) {
        const retryAfter = result.detail?.retry_after || 60;
        handleRateLimit(retryAfter, "updating theme preference");
        return;
      }

      if (!response.ok) {
        console.error("Failed to save dark mode preference:", result.detail);
        // Don't show error to user as the UI change already happened
      }
    } catch (error) {
      console.error("Dark mode update error:", error);
      // Don't show error to user as the UI change already happened
    }
  };

  const handleToggleAIUse = async () => {
    const newAiUse = !aiUse;
    
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_URL}/change_ai_use`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ai_use: newAiUse }),
      });

      const result = await response.json();

      if (response.status === 401) {
        handleTokenExpiry();
        return;
      }

      if (response.status === 429) {
        const retryAfter = result.detail?.retry_after || 60;
        handleRateLimit(retryAfter, "updating AI usage preference");
        return;
      }

      if (response.ok) {
        setAiUse(newAiUse);
        setSuccessMessage("✅ AI usage preference updated successfully!");
      } else {
        setAlertMessage(result.detail || "Failed to update AI usage preference. Please try again.");
      }
    } catch (error) {
      console.error("AI usage update error:", error);
      setAlertMessage("Failed to update AI usage preference. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    setShowDeleteConfirm(true);
    setDeleteConfirmText("");
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmText !== "DELETE") {
      setAlertMessage("Please type 'DELETE' to confirm account deletion.");
      return;
    }

    setShowDeleteConfirm(false);
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_URL}/delete_user`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.status === 401) {
        handleTokenExpiry();
        return;
      }

      if (response.status === 429) {
        const retryAfter = result.detail?.retry_after || 60;
        handleRateLimit(retryAfter, "deleting your account");
        return;
      }

      if (response.ok) {
        // Clear all user data from localStorage
        localStorage.removeItem("authToken");
        localStorage.removeItem("userPreferences");
        
        setSuccessMessage("✅ Account deleted successfully. You will be redirected to the login page.");
        
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 2000);
      } else {
        setAlertMessage(result.detail || "Failed to delete account. Please try again.");
      }
    } catch (error) {
      console.error("Account deletion error:", error);
      setAlertMessage("Failed to delete account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setDeleteConfirmText("");
  };

  return (
    <div className="settings-page">
      {/* Header/Navbar */}
      <header className="settings-header-nav">
        <div className="logo-container" onClick={() => navigate('/snippets')} style={{ cursor: 'pointer' }}>
          <img src="/CodeNest.png" alt="CodeNest" className="logo-image" />
          <h1 className="logo">CodeNest</h1>
        </div>
        <button className="login-button" onClick={() => navigate('/snippets')}>
          Back to Snippets
        </button>
      </header>

      <div className="settings-container">
        {/* Header */}
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Manage your account settings and preferences</p>
        </div>


        {/* Content */}
        <div className="settings-content">
          
          {/* Account Settings Section */}
          <div className="settings-section">
            <div className="section-header">
              <h2>Account settings</h2>
              <p>Manage your email and password. Currently there is no way to reset your password if you forget it.</p>
            </div>
            
            <div className="section-body">
              {/* Email Update Form */}
              <form onSubmit={handleUpdateEmail} className="settings-form">
                <div className="form-row">
                  <label htmlFor="email">Email</label>
                  <div className="input-group">
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      disabled={loading || isRateLimited}
                    />
                    <button 
                      type="submit" 
                      className="btn btn-sm"
                      disabled={loading || isRateLimited || !email.trim()}
                    >
                      {loading ? 'Updating...' : 'Update'}
                    </button>
                  </div>
                </div>
              </form>

              {/* Password Change Form */}
              <div className="form-divider"></div>
              <form onSubmit={handleUpdatePassword} className="settings-form">
                <div className="form-section-title">
                  <h3>Change password</h3>
                </div>
                
                <div className="form-row">
                  <label htmlFor="current-password">Current password</label>
                  <input
                    type="password"
                    id="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    disabled={loading || isRateLimited}
                  />
                </div>
                
                <div className="form-row">
                  <label htmlFor="new-password">New password</label>
                  <input
                    type="password"
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                    disabled={loading || isRateLimited}
                  />
                </div>
                
                <div className="form-row">
                  <label htmlFor="confirm-password">Confirm new password</label>
                  <input
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    disabled={loading || isRateLimited}
                  />
                </div>
                
                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading || isRateLimited || !currentPassword || !newPassword || !confirmPassword}
                  >
                    {loading ? 'Updating password...' : 'Update password'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="settings-section">
            <div className="section-header">
              <h2>Appearance</h2>
              <p>Customize how CodeNest looks on your device.</p>
            </div>
            
            <div className="section-body">
              <div className="form-row">
                <label>Theme preference</label>
                <div className="theme-selector">
                  <div className="theme-options">
                    <div className={`theme-option selected`}>
                      <div className="theme-preview light-preview">
                        <div className="preview-header"></div>
                        <div className="preview-content">
                          <div className="preview-line"></div>
                          <div className="preview-line short"></div>
                        </div>
                      </div>
                      <span>Light</span>
                    </div>
                    
                    <div className={`theme-option`} style={{ opacity: 0.5 }}>
                      <div className="theme-preview dark-preview">
                        <div className="preview-header"></div>
                        <div className="preview-content">
                          <div className="preview-line"></div>
                          <div className="preview-line short"></div>
                        </div>
                      </div>
                      <span>Dark</span>
                    </div>
                  </div>
                  
                  <div className="theme-toggle-section">
                    <label className="toggle-switch" style={{ opacity: 0.5 }}>
                      <input
                        type="checkbox"
                        checked={false}
                        disabled={true}
                        onChange={() => {}}
                      />
                      <span className="slider"></span>
                    </label>
                    <span className="toggle-label" style={{ opacity: 0.5 }}>
                      Light mode (Dark mode not implemented)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Settings Section */}
          <div className="settings-section">
            <div className="section-header">
              <h2>AI Features</h2>
              <p>Control whether AI features are enabled for your account.</p>
            </div>
            
            <div className="section-body">
              <div className="form-row">
                <label>AI Usage</label>
                <div className="theme-selector">
                  <div className="theme-toggle-section">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={aiUse}
                        onChange={handleToggleAIUse}
                      />
                      <span className="slider"></span>
                    </label>
                    <span className="toggle-label">
                      {aiUse ? 'AI features enabled' : 'AI features disabled'}
                    </span>
                  </div>
                  <p style={{ 
                    fontSize: '14px', 
                    color: 'var(--subtext-light)', 
                    marginTop: '8px',
                    lineHeight: '1.4'
                  }} className="ai-description">
                    When enabled, AI will help analyze and enhance your code snippets with automatic language detection, tags, and suggestions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone Section */}
          <div className="settings-section danger-zone">
            <div className="section-header">
              <h2>Danger Zone</h2>
              <p>Irreversible and destructive actions.</p>
            </div>
            
            <div className="section-body">
              <div className="form-row">
                <div className="danger-action">
                  <button 
                    className="btn btn-danger"
                    onClick={handleDeleteAccount}
                    disabled={loading || isRateLimited}
                  >
                    Delete Account
                  </button>
                  <div className="danger-info">
                    <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Alert Messages */}
        {alertMessage && (
          <div className="alert-container">
            <Alert 
              message={alertMessage} 
              onClose={() => {
                if (rateLimitTimer) {
                  clearInterval(rateLimitTimer);
                  setRateLimitTimer(null);
                }
                setIsRateLimited(false);
                setAlertMessage("");
              }} 
            />
          </div>
        )}

        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="modal-container delete-confirm-modal">
              <div className="modal-header">
                <h2>🚨 Delete Account</h2>
              </div>
              
              <div className="modal-body">
                <p><strong>This action cannot be undone!</strong></p>
                <div className="warning-list">
                  <p><strong>This will permanently:</strong></p>
                  <ul>
                    <li>Delete your account</li>
                    <li>Delete all your code snippets</li>
                    <li>Remove all your data</li>
                    <li>Log you out of all devices</li>
                  </ul>
                </div>
                
                <div className="confirmation-input-section">
                  <p>To confirm, type <strong>DELETE</strong> in the box below:</p>
                  <input
                    type="text"
                    className="delete-confirmation-input"
                    placeholder="Type DELETE to confirm"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="btn btn-secondary" 
                  onClick={handleDeleteCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={handleDeleteConfirm}
                  disabled={loading || deleteConfirmText !== "DELETE"}
                >
                  {loading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
