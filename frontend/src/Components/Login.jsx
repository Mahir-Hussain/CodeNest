import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login(){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

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
  <>
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
  </>
);

  // return (
  //   <div className="loginContainer">
  //     <h1>Login</h1>
  //     <form className="form" onSubmit={submitDetails}> 
  //       <input 
  //         type="email" 
  //         placeholder="Email" 
  //         value={email} 
  //         onChange={(e) => setEmail(e.target.value)} 
  //         required
  //       />
  //       <input 
  //         type="password" 
  //         placeholder="Password" 
  //         value={password} 
  //         onChange={(e) => setPassword(e.target.value)} 
  //         required
  //       />
  //       <button type="submit">Login</button>
  //       <button type="button" onClick={() => navigate("/Signup")}>Sign Up</button>
  //     </form>
  //   </div>
  // );
}

export default Login;