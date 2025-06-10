import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Login(){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isDark) {
      document.body.style.backgroundColor = '#0d1117';
      document.body.style.color = '#f0f6fc';
    } else {
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#24292f';
    }
  }, [isDark]);

  async function submitDetails(e){
    e.preventDefault();

    try{
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({email, password}),
      });
      
      if (!response.ok){
        throw new Error("HTTP error");
      }

      const result = await response.text();
      console.log(result);
      
      if(result.includes("Login successful")){
        alert("Login successful!");
        navigate("/snippets"); // Only navigate on successful login
      } else {
        alert("Login failed - invalid credentials");
      }

    } catch(error){
      console.error(error);
      alert("Login failed, try again");
    }
  }

return (
  <div className={`app ${isDark ? 'dark' : 'light'}`}>
    <button 
      className="theme-toggle" 
      onClick={() => setIsDark(!isDark)}
      aria-label="Toggle theme"
    >
      {isDark ? '☀️' : '🌙'}
    </button>

    <div className="welcome-header">
      <h1>Welcome to CodeNest</h1>
      <p>Sign in to your account to continue</p>
    </div>

  <div className="loginContainer">
    <h1>Login</h1>
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
  </div>
);
}

export default Login;