import { useState } from "react";
import "../../styles/Auth.css";

export default function Login({ onLogin, onSwitchToRegister, onGuestMode, loading }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Vui lòng nhập email và mật khẩu");
      return;
    }

    try {
      await onLogin(formData.email, formData.password, formData.rememberMe);
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h1 className="auth-title">Đăng nhập</h1>
        <p className="auth-subtitle">Chào mừng bạn quay lại!</p>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="form-input"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Mật khẩu
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="form-input"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            autoComplete="current-password"
          />
        </div>

        <div className="form-checkbox">
          <input
            id="rememberMe"
            name="rememberMe"
            type="checkbox"
            checked={formData.rememberMe}
            onChange={handleChange}
            disabled={loading}
          />
          <label htmlFor="rememberMe">Ghi nhớ đăng nhập</label>
        </div>

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        <div className="auth-divider">hoặc</div>

        <button
          type="button"
          className="auth-button secondary"
          onClick={onGuestMode}
          disabled={loading}
        >
          Tiếp tục với chế độ khách
        </button>
      </form>

      <div className="auth-footer">
        Chưa có tài khoản?{" "}
        <a className="auth-link" onClick={onSwitchToRegister}>
          Đăng ký ngay
        </a>
      </div>
    </div>
  );
}
