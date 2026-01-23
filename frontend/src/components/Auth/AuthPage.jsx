import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/Auth.css";
import Login from "./Login";
import Register from "./Register";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login, register, loginAsGuest } = useAuth();

  const handleLogin = async (email, password, rememberMe) => {
    setLoading(true);
    try {
      await login(email, password, rememberMe);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (name, email, password) => {
    setLoading(true);
    try {
      await register(name, email, password);
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

  return (
    <div className="auth-page">
      <div className="auth-container">
        {isLogin ? (
          <Login
            onLogin={handleLogin}
            onSwitchToRegister={() => setIsLogin(false)}
            onGuestMode={handleGuestMode}
            loading={loading}
          />
        ) : (
          <Register
            onRegister={handleRegister}
            onSwitchToLogin={() => setIsLogin(true)}
            onGuestMode={handleGuestMode}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
