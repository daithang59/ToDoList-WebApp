import { useState } from "react";
import "../../styles/Auth.css";

export default function Register({ onRegister, onSwitchToLogin, onGuestMode, loading }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (formData.password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      await onRegister(formData.name, formData.email, formData.password);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Đăng ký thất bại";
      const errors = err.response?.data?.errors;
      
      if (errors && Array.isArray(errors)) {
        setError(errors.map(e => e.message).join(", "));
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

    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const getStrengthClass = () => {
    if (passwordStrength < 40) return "weak";
    if (passwordStrength < 70) return "medium";
    return "strong";
  };

  const getStrengthLabel = () => {
    if (passwordStrength < 40) return "Yếu";
    if (passwordStrength < 70) return "Trung bình";
    return "Mạnh";
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h1 className="auth-title">Đăng ký</h1>
        <p className="auth-subtitle">Tạo tài khoản mới để bắt đầu</p>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="name">
            Họ và tên
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="form-input"
            placeholder="Nguyễn Văn A"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            autoComplete="name"
          />
        </div>

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
            autoComplete="new-password"
          />
          {formData.password && (
            <div className="password-strength">
              <div
                className={`password-strength-bar ${getStrengthClass()}`}
                style={{ width: `${passwordStrength}%` }}
              />
            </div>
          )}
          {formData.password && (
            <small style={{ fontSize: "0.8rem", color: "#64748b" }}>
              Độ mạnh: {getStrengthLabel()}
            </small>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">
            Xác nhận mật khẩu
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            className="form-input"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
            autoComplete="new-password"
          />
        </div>

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? "Đang đăng ký..." : "Đăng ký"}
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
        Đã có tài khoản?{" "}
        <a className="auth-link" onClick={onSwitchToLogin}>
          Đăng nhập
        </a>
      </div>
    </div>
  );
}
