import './App.css';

function App() {
  return (
    <div className="loginContainer">
      <h1>Login</h1>
      <form className="form"> 
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default App;