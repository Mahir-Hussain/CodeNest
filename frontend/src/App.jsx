import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Login from './Components/Login';
import SignUp from './Components/Signup';
import SnippetView from './Components/SnippetView';
import Snippets from './Components/Snippets';
import Demo from './Components/Demo';
import Home from './Components/Home';
import ProtectedRoute from './Components/services/ProtectedRoute';
import { ThemeProvider } from './Components/services/ThemeContext';
import Settings from './Components/Settings';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/Signup" element={<SignUp />} />
          <Route path="/snippet_view/:snippetId" element={<SnippetView />} />
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
          <Route path="*" element={<Home />} />
        </Routes>
      </Router>
      <Analytics />
    </ThemeProvider>
  );
}

export default App;
