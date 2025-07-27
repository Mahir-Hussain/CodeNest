/**
 * Handles JWT token expiry by clearing authentication data and redirecting to login
 */
const handleTokenExpiry = () => {
  
  localStorage.removeItem('authToken');
  localStorage.removeItem('theme');
  window.location.href = '/';
};

export default handleTokenExpiry;
