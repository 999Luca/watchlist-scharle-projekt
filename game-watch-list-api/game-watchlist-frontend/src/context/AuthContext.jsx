import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const navigate = useNavigate();
  // Beim Login die Daten speichern
  const login = (userId, isAdmin, username) => {
    setIsLoggedIn(true);
    setIsAdmin(isAdmin);
    setUserId(userId);
    setUsername(username);

    // Speichere die Daten im localStorage
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("isAdmin", isAdmin);
    localStorage.setItem("userId", userId);
    localStorage.setItem("username", username);
  };

  // Beim Logout die Daten entfernen
  const logout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserId(null);
    setUsername(null);

    // Entferne die Daten aus dem localStorage
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");

    navigate("/");
  };

  // Beim Laden der Seite die Daten aus dem localStorage wiederherstellen
  useEffect(() => {
    const storedIsLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const storedIsAdmin = localStorage.getItem("isAdmin") === "true";
    const storedUserId = localStorage.getItem("userId");
    const storedUsername = localStorage.getItem("username");
  
    if (storedIsLoggedIn && storedUserId) {
      setIsLoggedIn(true);
      setIsAdmin(storedIsAdmin);
      setUserId(storedUserId); // Stelle sicher, dass userId gesetzt wird
      setUsername(storedUsername);
    }
  }, []);

  const deleteAccount = async () => {
    if (!window.confirm("Möchtest du deinen Account wirklich löschen? Alle Daten werden entfernt!")) return;
  
    try {
      console.log(`Sende Anfrage zum Löschen des Accounts mit userId: ${userId}`);
      const response = await fetch(`http://localhost:5000/users/${userId}`, {
        method: "DELETE",
      });
  
      if (response.ok) {
        alert("Dein Account wurde erfolgreich gelöscht.");
        logout(); // Logge den Benutzer aus
      } else {
        const data = await response.json();
        console.error("Fehler beim Löschen des Accounts:", data.error);
        alert(`Fehler: ${data.error || "Unbekannter Fehler"}`);
      }
    } catch (error) {
      console.error("Fehler beim Löschen des Accounts:", error);
      alert("Ein Fehler ist aufgetreten.");
    }
  };
  
  return (
    <AuthContext.Provider value={{ isLoggedIn, isAdmin, userId, username,deleteAccount, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);