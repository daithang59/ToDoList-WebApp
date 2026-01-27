import { useState } from "react";
import "../../styles/Auth.css";
import { getErrorMessage, getRetryAfter, isAccountLocked } from "../../utils/errorMessages";
import { validateEmail } from "../../utils/validators";

export default function Login({ onLogin, onSwitchToRegister, onSwitchToForgotPassword, onGuestMode, loading }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Vui lòng nhập email và mật khẩu");
      return;
    }

    if (!validateEmail(formData.email)) {
      setError("Email không hợp lệ");
      return;
    }

    try {
      await onLogin(formData.email, formData.password);
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      
      // Add retry time for locked accounts
      if (isAccountLocked(err)) {
        const retryAfter = getRetryAfter(err);
        if (retryAfter) {
          setError(`${errorMsg} (Thử lại sau ${retryAfter} phút)`);
        } else {
          setError(errorMsg);
        }
      } else {
        setError(errorMsg);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
          <div className="password-input-wrapper">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
        </div>

        <div className="form-actions">
          <a
            className="forgot-password-link"
            onClick={onSwitchToForgotPassword}
          >
            Quên mật khẩu?
          </a>
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
