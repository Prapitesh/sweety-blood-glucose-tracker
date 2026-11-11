import { createContext, useCallback, useContext, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sweety_user") || "null");
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("sweety_token"));

  const accept = useCallback((data) => {
    localStorage.setItem("sweety_token", data.token);
    localStorage.setItem("sweety_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }, []);

  const signIn = useCallback(
    async (body) => accept((await api.post("/auth/login", body)).data),
    [accept],
  );
  const signUp = useCallback(
    async (body) => accept((await api.post("/auth/register", body)).data),
    [accept],
  );
  const signOut = useCallback(() => {
    localStorage.removeItem("sweety_token");
    localStorage.removeItem("sweety_user");
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, signIn, signUp, signOut }),
    [user, token, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
};
