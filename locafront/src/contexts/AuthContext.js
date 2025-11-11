import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Vérifier le token au chargement initial
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    console.log('🔑 Token au chargement:', savedToken); // Debug
    console.log('👤 User au chargement:', savedUser); // Debug
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setLoggedIn(true);
      
      // Optionnel: Valider le token avec le backend
      validateToken(savedToken);
    }
  }, []);

  const validateToken = async (token) => {
    try {
      const response = await axios.get('http://localhost:3001/api/auth/validate', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Token validé:', response.data);
    } catch (error) {
      console.error('❌ Token invalide:', error);
      logout();
    }
  };

  const fetchUserData = async (token) => {
    try {
      // Décoder le token pour obtenir l'ID utilisateur
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      const userId = decodedPayload.id;

      console.log('🔍 Decoded payload:', decodedPayload);

      // Récupérer les données utilisateur complètes
      const response = await axios.get(`http://localhost:3001/api/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Données utilisateur récupérées:', response.data);

      // Stocker l'utilisateur et marquer comme connecté
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      setLoggedIn(true);
      
    } catch (error) {
      console.error('❌ Erreur récupération données utilisateur:', error);
      if (error.response) {
        console.error('📊 Response data:', error.response.data);
        console.error('📊 Response status:', error.response.status);
      }
      logout();
    }
  };

  const login = async (newToken) => {
    console.log('🔑 Nouveau token reçu:', newToken);
    
    if (!newToken) {
      console.error('❌ Aucun token reçu lors de la connexion');
      return;
    }
    
    try {
      // Stocker le token immédiatement
      setToken(newToken);
      localStorage.setItem('token', newToken);
      console.log('✅ Token stocké dans localStorage');
      
      // Récupérer les données utilisateur
      await fetchUserData(newToken);
      
    } catch (error) {
      console.error('❌ Erreur lors de la connexion:', error);
      logout();
    }
  };

  const logout = () => {
    console.log('🚪 Déconnexion...');
    setLoggedIn(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('✅ Données supprimées du localStorage');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ 
      loggedIn, 
      user, 
      token, 
      login, 
      logout, 
      updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export { AuthContext };
