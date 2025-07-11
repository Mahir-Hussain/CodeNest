import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from './Alert';

function Login(){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
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
  console.log("submit");

  try {
    console.log("API URL:", API_URL);
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email.trim(), password: password.trim() }),
    });

    if (!response.ok) {
      // Server responded with error status like 400, 500 etc
      const errorText = await response.text();
      console.error("HTTP error response:", errorText);
      setAlertMessage("Login failed: server error");
      return;
    }

    const result = await response.json();
    console.log("Login API result:", result);

    if (result && result.success && result.token) {
      console.log("Login success");
      localStorage.setItem("authToken", result.token);
      localStorage.setItem("userId", result.userid);

      setAlertMessage("Login successful!");
      setTimeout(() => {
        navigate("/snippets", { replace: true });
      }, 1000);
    } else {
      setAlertMessage(result.error || "Login failed - invalid credentials");
    }
  } catch (error) {
    console.error("Fetch/login error:", error);
    setAlertMessage("Login failed, please try again.");
  }
}


return (
  <>
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

      <button type="submit">Login</button>
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