import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/http.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("examflow_token");
    if (!token) {
      setLoading(false);
      return;
    }
    apiRequest("/auth/me")
      .then(({ user: current }) => setUser(current))
      .catch(() => localStorage.removeItem("examflow_token"))
      .finally(() => setLoading(false));
  }, []);

  async function authenticate(path, payload) {
    const result = await apiRequest(path, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    localStorage.setItem("examflow_token", result.token);
    setUser(result.user);
    return result.user;
  }

  const value = useMemo(() => ({
    user,
    loading,
    login: (payload) => authenticate("/auth/login", payload),
    register: (payload) => authenticate("/auth/register", payload),
    logout: () => {
      localStorage.removeItem("examflow_token");
      setUser(null);
    }
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
