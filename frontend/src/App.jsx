import { useState } from 'react';
import './App.css';

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
      }

  }catch(error){
    console.error(error);
    alert("Login failed, try again");
    }
  }
  return (
    <div className="loginContainer">
      <h1>Login</h1>
      <form className="form" onSubmit={submitDetails}> 
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default App;