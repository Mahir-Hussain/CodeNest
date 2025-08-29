import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Alert from './services/Alert';
import './css/Signup.css';

function SignUp() {
  const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [retypePassword, setRetypePassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showRetypePassword, setShowRetypePassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [alertMessage, setAlertMessage] = useState("");
    const API_URL = import.meta.env.VITE_API_URL;


    async function signUp(e){
        e.preventDefault();
        setIsLoading(true);
        
        // Validate passwords match
        if (password !== retypePassword) {
            setAlertMessage("Passwords do not match!");
            setIsLoading(false);
            return;
        }
        
        // Validate password length
        if (password.length < 6) {
            setAlertMessage("Password must be at least 6 characters long!");
            setIsLoading(false);
            return;
        }
        
        try{
            const response = await fetch(`${API_URL}/create_user`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({username, password}),
            });
            
            const result = await response.json();
            // console.log("Signup API result:", result);

            if (response.status === 429) {
                // Handle rate limiting
                const retryAfter = result.detail?.retry_after || 60;
                setAlertMessage(`Too many signup attempts! Please wait ${retryAfter} seconds before trying again.`);
                setIsLoading(false);
                return;
            }
            
            if (!response.ok){
                setAlertMessage(result.detail || "Account creation failed, try again");
                setIsLoading(false);
                return;
            }
            
            if(result.message && result.message.includes("User created successfully")){
                setAlertMessage("Account created successfully!");
                setTimeout(() => {
                    navigate("/login");
                    setIsLoading(false);
                }, 1500);
            }
        }catch (error){
            // console.log(error);
            setAlertMessage("Account creation failed, try again");
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
        <h1>Create Your Account</h1>
        <p>Sign up to start organizing your code snippets</p>
        <div style={{ 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffeaa7', 
          borderRadius: '6px', 
          padding: '12px', 
          margin: '15px 0',
          fontSize: '14px',
          color: '#856404'
        }}>
          <strong>Note:</strong> Account creation may take a few seconds as our server spins up from sleep mode. You may have to signup again if the server is inactive for a while.
        </div>
      </div>

      <div className="signupContainer">
        <h1>Sign Up</h1>
        <form className="form" onSubmit={signUp}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
         <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              style={{ paddingRight: '60px', width: '100%', boxSizing: 'border-box' }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#666',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '40px',
                height: '24px',
                fontWeight: '500'
              }}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input 
              type={showRetypePassword ? "text" : "password"}
              placeholder="Retype Password" 
              value={retypePassword} 
              onChange={(e) => setRetypePassword(e.target.value)} 
              style={{ paddingRight: '60px', width: '100%', boxSizing: 'border-box' }}
              required
            />
            <button
              type="button"
              onClick={() => setShowRetypePassword(!showRetypePassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#666',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '40px',
                height: '24px',
                fontWeight: '500'
              }}
              title={showRetypePassword ? 'Hide password' : 'Show password'}
            >
              {showRetypePassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="loading-spinner"></span>
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        <div className="auth-link">
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </>
    );
}

export default SignUp;