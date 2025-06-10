import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SignUp() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        if (isDark) {
          document.body.style.backgroundColor = '#0d1117';
          document.body.style.color = '#f0f6fc';
        } else {
          document.body.style.backgroundColor = '#ffffff';
          document.body.style.color = '#24292f';
        }
      }, [isDark]);

    async function signUp(e){
        e.preventDefault();
        
        try{
            const response = await fetch("http://localhost:8000/create_user", {
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
            if(result.includes("User created successfully")){
                alert("Account created");
                navigate("/");
            }
        }catch (error){
            console.log(error);
            alert("Account creation failed, try again");
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

        <div className="signupContainer">
          <h1>Sign Up</h1>
          <form className="form" onSubmit={signUp}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">Create Account</button>
          </form>
        </div>
    </div>
    );
}

export default SignUp;