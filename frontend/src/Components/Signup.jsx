import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SignUp() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();


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
    <>
        <div className="signupContainer">
          <h1>Sign Up</h1>
          <form className="form" onSubmit={signUp}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">Create Account</button>
          </form>
        </div>
    </>
    );
}

export default SignUp;