import { useState } from "react";
import "../../styles/Auth.css";
import { getErrorMessage } from "../../utils/errorMessages";
import { validateEmail } from "../../utils/validators";

export default function ForgotPassword({ onBackToLogin, onSendReset, loading }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Vui lòng nhập email");
      return;
    }

    if (!validateEmail(email)) {
      setError("Email không hợp lệ");
      return;
    }

    try {
      await onSendReset(email);
      setSuccess(true);
      setEmail("");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (success) {
    return (
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">✉️ Kiểm tra email</h1>
        </div>

        <div className="auth-success">
          <p>
            Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu trong vài phút.
          </p>
          <p style={{ marginTop: "12px", fontSize: "14px", color: "#666" }}>
            Không nhận được email? Kiểm tra thư mục spam hoặc thử lại.
          </p>
        </div>

        <button
          type="button"
          className="auth-button"
          onClick={onBackToLogin}
        >
          Quay lại đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h1 className="auth-title">Quên mật khẩu?</h1>
        <p className="auth-subtitle">
          Nhập email của bạn để nhận link đặt lại mật khẩu
        </p>
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
            autoFocus
          />
        </div>

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
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
