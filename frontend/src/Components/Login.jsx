import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from './services/Alert';

function Login(){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate("/snippets", { replace: true });
    }
  }, [navigate]);

async function submitDetails(e) {
  e.preventDefault();
  setIsLoading(true);
  // console.log("submit");

  try {
    // console.log("API URL:", API_URL);
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email.trim(), password: password.trim() }),
    });

    const result = await response.json();
    // console.log("Login API result:", result);

    if (response.status === 429) {
      // Handle rate limiting
      const retryAfter = result.detail?.retry_after || 60;
      setAlertMessage(`Too many login attempts! Please wait ${retryAfter} seconds before trying again.`);
      setIsLoading(false);
      return;
    }

    if (!response.ok) {
      // Server responded with error status like 400, 500 etc
      console.error("HTTP error response:", result);
      setAlertMessage(result.detail || "Login failed: server error");
      setIsLoading(false);
      return;
    }

    if (result && result.success && result.token) {
      // console.log("Login success");
      localStorage.setItem("authToken", result.token);
      localStorage.setItem("userId", result.userid);

      setAlertMessage("Login successful!");
      setTimeout(() => {
        navigate("/snippets", { replace: true });
        setIsLoading(false);
      }, 1000);
    } else {
      setAlertMessage(result.error || "Login failed - invalid credentials");
      setIsLoading(false);
    }
  } catch (error) {
    console.error("Fetch/login error:", error);
    setAlertMessage("Login failed, please try again.");
    setIsLoading(false);
  }
}


return (
  <>
    <header className="home-header">
      <div className="logo-container" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <img src="/CodeNest.png" alt="CodeNest" className="logo-image" />
        <h1 className="logo">CodeNest</h1>
      </div>
    </header>
    
    <Alert message={alertMessage} onClose={() => setAlertMessage("")} />
    <div className="welcome-header">
      <h1>Welcome to CodeNest</h1>
      <p>Sign in to your account to continue</p>
    </div>

  <div className="loginContainer">

    <form className="form" onSubmit={submitDetails}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={(event) => setPassword(event.target.value)} 
        required
      />

      <button type="submit" disabled={isLoading}>
        {isLoading ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span className="loading-spinner"></span>
            Logging in...
          </span>
        ) : (
          'Login'
        )}
      </button>
    </form>
  </div>

    <div className='signupContainer'>
      <h6>No account?</h6>
      <button type="button" onClick={() => navigate("/Signup")}>Sign Up</button>
    </div>
  </>
);
}

export default Login;