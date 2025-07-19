import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from './services/Alert';

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
            if (!response.ok){
                throw new Error("HTTP error");
            }
            const result = await response.text();
            console.log(result);
            if(result.includes("User created successfully")){
                setAlertMessage("Account created");
                navigate("/");
            }
        }catch (error){
            console.log(error);
            setAlertMessage("Account creation failed, try again");
        }
    }
    return (
    <>
      <Alert message={alertMessage} onClose={() => setAlertMessage("")} />
      <div className="signupContainer">
        <h1>Sign Up</h1>
        <form className="form" onSubmit={signUp}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">Create Account</button>
        </form>
      </div>
    </>
    );
}

export default SignUp;