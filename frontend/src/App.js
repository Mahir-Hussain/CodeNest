import './App.css';

function App() {
  return (
    <div className = "loginContainer">
      <h1>Login</h1>
      <form className = "form"> 
        <input type="email" placeholder="Email"></input><br /><br />
        <input type="password" placeholder="Password"></input><br /><br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default App;
