/**
 * Handles JWT token expiry by clearing authentication data and redirecting to login
 */
const handleTokenExpiry = () => {
  console.log('Token expired, clearing auth data and redirecting to login');
  localStorage.removeItem('authToken');
  localStorage.removeItem('theme');
  window.location.href = '/';
};

export default handleTokenExpiry;
