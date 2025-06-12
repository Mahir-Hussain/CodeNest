// src/App.jsx
import Login from './Components/Login';
import SignUp from './Components/Signup';
import Snippets from './Components/Snippets';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Signup" element={<SignUp />} />
        <Route path="/snippets" element={<Snippets />} />
      </Routes>
    </Router>
  );
}

export default App;