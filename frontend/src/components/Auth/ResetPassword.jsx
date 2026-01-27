import { useState } from "react";
import "../../styles/Auth.css";
import { getErrorMessage } from "../../utils/errorMessages";
import { validateConfirmPassword, validatePassword } from "../../utils/validators";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";

export default function ResetPassword({ token, onResetPassword, onBackToLogin, loading }) {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.errors[0]);
      return;
    }

    // Validate confirm password
    const confirmValidation = validateConfirmPassword(
      formData.password,
      formData.confirmPassword
    );
    if (!confirmValidation.valid) {
      setError(confirmValidation.error);
      return;
    }

    try {
      await onResetPassword(token, formData.password);
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (success) {
    return (
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">✓ Đặt lại mật khẩu thành công!</h1>
        </div>

        <div className="auth-success">
          <p>Mật khẩu của bạn đã được đặt lại thành công.</p>
          <p style={{ marginTop: "12px" }}>
            Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ.
          </p>
        </div>

        <button
          type="button"
          className="auth-button"
          onClick={onBackToLogin}
        >
          Đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h1 className="auth-title">Đặt lại mật khẩu</h1>
        <p className="auth-subtitle">Nhập mật khẩu mới của bạn</p>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Mật khẩu mới
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
              autoComplete="new-password"
              autoFocus
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
          <PasswordStrengthIndicator password={formData.password} />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">
            Xác nhận mật khẩu
          </label>
          <div className="password-input-wrapper">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              className="form-input"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
            >
              {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
        </div>

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
        </button>
      </form>

      <div className="auth-footer">
        Nhớ mật khẩu rồi?{" "}
        <a className="auth-link" onClick={onBackToLogin}>
          Đăng nhập
        </a>
      </div>
    </div>
  );
}
