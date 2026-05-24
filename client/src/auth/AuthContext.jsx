import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("salon_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    localStorage.setItem("salon_token", data.token);
    localStorage.setItem("salon_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      // Ignore logout error
    }
    localStorage.removeItem("salon_token");
    localStorage.removeItem("salon_user");
    setUser(null);
  };

  useEffect(() => {
    if (!localStorage.getItem("salon_token")) {
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
