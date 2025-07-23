  // Handle JWT token expiry
  const handleTokenExpiry = () => {
    // console.log('Token expired, clearing auth data and redirecting to login');
    localStorage.removeItem('authToken');
    localStorage.removeItem('theme');
    window.location.href = '/login';
  };

export default handleTokenExpiry;