import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // Added token state

  useEffect(() => {
    // Retrieve token from local storage on initial load
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      // Fetch user data if a token is present
      fetchUserData(savedToken);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      const userId = decodedPayload.id;

      console.log('Decoded payload:', decodedPayload); // Debugging

      const response = await axios.get(`http://localhost:3001/api/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Fetched user data:', response.data); // Debugging

      setUser(response.data);
      setLoggedIn(true);
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
      // Optionally handle token expiration or errors here
      logout(); // Logout if fetching user data fails
    }
  };

  const login = (newToken) => {
    console.log('Login Token:', newToken); // Debugging
    setToken(newToken);
    localStorage.setItem('token', newToken);
    fetchUserData(newToken); // Fetch user data after login
  };

  const logout = () => {
    setLoggedIn(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ loggedIn, user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export { AuthContext };
