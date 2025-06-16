// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Components/Login';
import SignUp from './Components/Signup';
import Snippets from './Components/Snippets';
import ProtectedRoute from './Components/ProtectedRoute';
import { ThemeProvider } from './Components/ThemeContext';
import Settings from './Components/Settings';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/Signup" element={<SignUp />} />
          <Route
            path="/snippets"
            element={
              <ProtectedRoute>
                <Snippets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
