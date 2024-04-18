import { useState } from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if token exists in local storage
   // const token = localStorage.getItem('token');
    const tokenCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('token='))?.split('=')[1];
    return !!tokenCookie;
  });

  const login = (token: string) => {
    const expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + (1 * 60 * 20 * 1000)); // 1 godzina w milisekundach
    document.cookie = `token=${token}; path=/; expires=${expiryDate.toUTCString()}`;
    setIsAuthenticated(true);
  };

  const logout = () => {
      document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      setIsAuthenticated(false);
  };
  const token = (() => {
    const tokenCookie = document.cookie.split(";").find((cookie) => cookie.trim().startsWith("token="))?.split("=")[1];
    return tokenCookie;
  })();

  return { isAuthenticated, login, logout, token };
};