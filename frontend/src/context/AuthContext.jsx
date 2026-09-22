import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jt_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then(({ user: u }) => setUser(u))
      .catch(() => localStorage.removeItem("jt_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, user: u } = await api.login({ email, password });
    localStorage.setItem("jt_token", token);
    setUser(u);
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { token, user: u } = await api.register({ name, email, password });
    localStorage.setItem("jt_token", token);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("jt_token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
