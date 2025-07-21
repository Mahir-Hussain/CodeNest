import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Alert from './services/Alert';
import './css/Signup.css';

function SignUp() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [alertMessage, setAlertMessage] = useState("");
    const API_URL = import.meta.env.VITE_API_URL;


    async function signUp(e){
        e.preventDefault();
        try{
            const response = await fetch(`${API_URL}/create_user`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({email, password}),
            });
            
            const result = await response.json();
            console.log("Signup API result:", result);

            if (response.status === 429) {
                // Handle rate limiting
                const retryAfter = result.detail?.retry_after || 60;
                setAlertMessage(`Too many signup attempts! Please wait ${retryAfter} seconds before trying again.`);
                return;
            }
            
            if (!response.ok){
                setAlertMessage(result.detail || "Account creation failed, try again");
                return;
            }
            
            if(result.message && result.message.includes("User created successfully")){
                setAlertMessage("Account created successfully!");
                setTimeout(() => {
                    navigate("/");
                }, 1500);
            }
        }catch (error){
            console.log(error);
            setAlertMessage("Account creation failed, try again");
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
      <div className="signupContainer">
        <h1>Sign Up</h1>
        <form className="form" onSubmit={signUp}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">Create Account</button>
        </form>
        <div className="auth-link">
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </>
    );
}

export default SignUp;