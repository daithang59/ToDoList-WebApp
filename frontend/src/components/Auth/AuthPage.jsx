import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/Auth.css";
import Toast from "../common/Toast";
import ForgotPassword from "./ForgotPassword";
import Login from "./Login";
import Register from "./Register";
import ResetPassword from "./ResetPassword";

export default function AuthPage() {
  const [view, setView] = useState("login"); // login, register, forgot-password, reset-password
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const { login, register, loginAsGuest, sendPasswordReset, resetPassword } = useAuth();

  // Handle email verification and password reset tokens from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const action = params.get("action");

    if (token && action === "reset-password") {
      setView("reset-password");
    }
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      await login(email, password);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (name, email, password) => {
    setLoading(true);
    try {
      const result = await register(name, email, password);
      if (result.message) {
        showToast(result.message, "success");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = async () => {
    setLoading(true);
    try {
      await loginAsGuest();
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (email) => {
    setLoading(true);
    try {
      const result = await sendPasswordReset(email);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (token, password) => {
    setLoading(true);
    try {
      const result = await resetPassword(token, password);
      showToast(result.message, "success");
      return result;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {view === "login" && (
          <Login
            onLogin={handleLogin}
            onSwitchToRegister={() => setView("register")}
            onSwitchToForgotPassword={() => setView("forgot-password")}
            onGuestMode={handleGuestMode}
            loading={loading}
          />
        )}

        {view === "register" && (
          <Register
            onRegister={handleRegister}
            onSwitchToLogin={() => setView("login")}
            onGuestMode={handleGuestMode}
            loading={loading}
          />
        )}

        {view === "forgot-password" && (
          <ForgotPassword
            onBackToLogin={() => setView("login")}
            onSendReset={handleForgotPassword}
            loading={loading}
          />
        )}

        {view === "reset-password" && (
          <ResetPassword
            token={new URLSearchParams(window.location.search).get("token")}
            onResetPassword={handleResetPassword}
            onBackToLogin={() => setView("login")}
            loading={loading}
          />
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
