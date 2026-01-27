import { createContext, useContext, useEffect, useState } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = authService.getToken();
      const savedRefreshToken = authService.getRefreshToken();
      const savedUser = authService.getUser();

      if (savedToken && savedUser) {
        setToken(savedToken);
        setRefreshToken(savedRefreshToken);
        setUser(savedUser);
        setIsGuest(false);
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const loginUser = async (email, password) => {
    const data = await authService.login(email, password);

    setToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setUser(data.user);
    setIsGuest(false);

    authService.saveToken(data.accessToken);
    authService.saveRefreshToken(data.refreshToken);
    authService.saveUser(data.user);

    // If there was a guest session, migrate the data
    const guestId = authService.getGuestId();
    if (guestId) {
      try {
        await authService.migrateGuestData(guestId);
        authService.removeGuestId();
      } catch (error) {
        console.error("Failed to migrate guest data:", error);
      }
    }

    return data;
  };

  const registerUser = async (name, email, password) => {
    const data = await authService.register(name, email, password);

    setToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setUser(data.user);
    setIsGuest(false);

    authService.saveToken(data.accessToken);
    authService.saveRefreshToken(data.refreshToken);
    authService.saveUser(data.user);

    // If there was a guest session, migrate the data
    const guestId = authService.getGuestId();
    if (guestId) {
      try {
        await authService.migrateGuestData(guestId);
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

  const logout = async () => {
    // Call backend to revoke refresh token
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch (error) {
        console.error("Logout error:", error);
      }
    }

    setToken(null);
    setRefreshToken(null);
    setUser(null);
    setIsGuest(false);
    authService.clearAuth();
  };

  const sendPasswordReset = async (email) => {
    const data = await authService.forgotPassword(email);
    return data;
  };

  const resetPassword = async (token, password) => {
    const data = await authService.resetPassword(token, password);
    return data;
  };

  const verifyEmail = async (token) => {
    const data = await authService.verifyEmail(token);

    // Update user state with verified email
    if (data.user) {
      setUser(data.user);
      authService.saveUser(data.user);
    }

    return data;
  };

  const resendVerification = async () => {
    const data = await authService.resendVerification();
    return data;
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    authService.saveUser(updatedUser);
  };

  const value = {
    user,
    token,
    refreshToken,
    loading,
    isGuest,
    isAuthenticated: !!token && !!user,
    isEmailVerified: user?.isEmailVerified || false,
    login: loginUser,
    register: registerUser,
    loginAsGuest,
    logout,
    sendPasswordReset,
    resetPassword,
    verifyEmail,
    resendVerification,
    updateUser,
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
