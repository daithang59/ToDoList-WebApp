import { createContext, useContext, useEffect, useState } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = authService.getToken();
      const savedUser = authService.getUser();

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(savedUser);
        setIsGuest(false);
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const loginUser = async (email, password, rememberMe = false) => {
    const data = await authService.login(email, password, rememberMe);
    
    setToken(data.token);
    setUser(data.user);
    setIsGuest(false);
    
    authService.saveToken(data.token);
    authService.saveUser(data.user);

    // If there was a guest session, migrate the data
    const guestId = authService.getGuestId();
    if (guestId) {
      try {
        await authService.migrateGuestData(data.token, guestId);
        authService.removeGuestId();
      } catch (error) {
        console.error("Failed to migrate guest data:", error);
      }
    }

    return data;
  };

  const registerUser = async (name, email, password) => {
    const data = await authService.register(name, email, password);
    
    setToken(data.token);
    setUser(data.user);
    setIsGuest(false);
    
    authService.saveToken(data.token);
    authService.saveUser(data.user);

    // If there was a guest session, migrate the data
    const guestId = authService.getGuestId();
    if (guestId) {
      try {
        await authService.migrateGuestData(data.token, guestId);
        authService.removeGuestId();
      } catch (error) {
        console.error("Failed to migrate guest data:", error);
      }
    }

    return data;
  };

  const loginAsGuest = async () => {
    // Generate a random client ID if not exists
    let guestId = authService.getGuestId();
    if (!guestId) {
      guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      authService.saveGuestId(guestId);
    }

    const data = await authService.getGuestToken(guestId);
    
    setToken(data.token);
    setUser({ name: "Guest User", email: null });
    setIsGuest(true);
    
    authService.saveToken(data.token);

    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsGuest(false);
    authService.clearAuth();
  };

  const value = {
    user,
    token,
    loading,
    isGuest,
    isAuthenticated: !!token && !!user,
    login: loginUser,
    register: registerUser,
    loginAsGuest,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
