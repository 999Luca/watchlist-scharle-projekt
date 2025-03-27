import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null); // Speichere die Benutzer-ID

  const login = (id) => {
    console.log("Logging in with userId:", id); // Debugging-Log
    setIsLoggedIn(true);
    setUserId(id); // Setze die Benutzer-ID beim Login
  };

  const logout = () => {
    console.log("Logging out"); // Debugging-Log
    setIsLoggedIn(false);
    setUserId(null); // Entferne die Benutzer-ID beim Logout
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  console.log("AuthContext values:", context); // Debugging-Log
  return context;
};