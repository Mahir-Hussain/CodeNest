import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from './Alert';
import ThemeContext from './services/ThemeContext';
import './css/Settings.css';

function Settings() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const navigate = useNavigate();

  // Correct destructuring to match your context
  const { isDark, toggleTheme } = useContext(ThemeContext);
  console.log('Theme isDark:', isDark);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  async function updateSettings(e) {
    e.preventDefault();
    console.log("Updating settings...");

    try {
      const response = await fetch("http://localhost:8000/update_settings", { // Link not a thing yet
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("HTTP error response:", errorText);
        setAlertMessage("Update failed: server error");
        return;
      }

      const result = await response.json();
      console.log("Update API result:", result);

      if (result && result.success) {
        setAlertMessage("Settings updated successfully!");
      } else {
        setAlertMessage(result.error || "Update failed - invalid data");
      }
    } catch (error) {
      console.error("Fetch/update error:", error);
      setAlertMessage("Update failed, please try again.");
    }
  }

  return (
    <div className="settings-container">
      <h2>Settings</h2>

      {/* Theme toggle */}
      <div className="theme-toggle">
        <label className="switch">
          <input
            type="checkbox"
            checked={isDark}
            onChange={toggleTheme}
          />
          <span className="slider round"></span>
        </label>
        <span style={{ marginLeft: '10px' }}>
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      </div>

      <form onSubmit={updateSettings}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Update Settings</button>
      </form>

      {alertMessage && <Alert message={alertMessage} />}
    </div>
  );
}

export default Settings;
