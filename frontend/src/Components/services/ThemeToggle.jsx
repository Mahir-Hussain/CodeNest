// ThemeToggle.jsx
import { useEffect, useState } from 'react';

function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.body.style.backgroundColor = '#0d1117';
      document.body.style.color = '#f0f6fc';
    } else {
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#24292f';
    }
  }, [isDark]);

  return (
    <button 
      className="theme-toggle" 
      onClick={() => setIsDark(!isDark)}
      aria-label="Toggle theme"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}

export default ThemeToggle;
