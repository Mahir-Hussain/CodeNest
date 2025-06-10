// src/App.jsx
import Login from './Components/Login';
import SignUp from './Components/Signup';
import Snippets from './Components/Snippets';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'; // Make sure this CSS file contains your theme styles
import { ThemeProvider } from './Components/ThemeContext'; // <-- Import your ThemeProvider

function App() {
  return (
    // Wrap your entire routing structure with the ThemeProvider
    // This makes the theme context available to all components rendered within Routes
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/Signup" element={<SignUp />} />
          <Route path="/snippets" element={<Snippets />} />
          {/* Add more routes for other pages here */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;