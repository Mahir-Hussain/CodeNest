import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from './services/Alert';
import ThemeContext from './services/ThemeContext';
import './css/Settings.css';

function Settings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  // Theme context
  const { isDark, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setAlertMessage("Email cannot be empty");
      return;
    }
    
    setLoading(true);
    try {
      // Simulate API call - replace with actual endpoint when backend is ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAlertMessage("Email updated successfully!");
      setEmail("");
    } catch (error) {
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
      // Simulate API call - replace with actual endpoint when backend is ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAlertMessage("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setAlertMessage("Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      {/* Header/Navbar */}
      <header className="settings-header-nav">
        <div className="logo-container">
          <img src="/CodeNest.png" alt="CodeNest" className="logo-image" />
          <h1 className="logo">CodeNest</h1>
        </div>
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
                      disabled={loading}
                    />
                    <button 
                      type="submit" 
                      className="btn btn-sm"
                      disabled={loading || !email.trim()}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
                  />
                </div>
                
                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading || !currentPassword || !newPassword || !confirmPassword}
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
                    <div className={`theme-option ${!isDark ? 'selected' : ''}`}>
                      <div className="theme-preview light-preview">
                        <div className="preview-header"></div>
                        <div className="preview-content">
                          <div className="preview-line"></div>
                          <div className="preview-line short"></div>
                        </div>
                      </div>
                      <span>Light</span>
                    </div>
                    
                    <div className={`theme-option ${isDark ? 'selected' : ''}`}>
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
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={isDark}
                        onChange={toggleTheme}
                      />
                      <span className="slider"></span>
                    </label>
                    <span className="toggle-label">
                      {isDark ? 'Dark mode enabled' : 'Light mode enabled'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Alert Messages */}
        {alertMessage && (
          <div className="alert-container">
            <Alert message={alertMessage} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
