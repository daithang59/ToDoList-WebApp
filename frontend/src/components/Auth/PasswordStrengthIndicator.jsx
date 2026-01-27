import "../../styles/PasswordStrength.css";
import { checkPasswordCriteria, getPasswordStrengthInfo } from "../../utils/validators";

export default function PasswordStrengthIndicator({ password }) {
  const strengthInfo = getPasswordStrengthInfo(password);
  const criteria = checkPasswordCriteria(password);

  if (!password) return null;

  const strength = Math.max(
    1,
    Object.values(criteria).filter(Boolean).length
  );
  const percentage = (strength / 5) * 100;

  return (
    <div className="password-strength">
      <div className="strength-meter">
        <div
          className="strength-meter-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: strengthInfo.color,
          }}
        />
      </div>
      <div className="strength-info">
        <span
          className="strength-label"
          style={{ color: strengthInfo.color }}
        >
          {strengthInfo.label}
        </span>
      </div>

      <div className="password-criteria">
        <div className={`criterion ${criteria.length ? "met" : ""}`}>
          <span className="criterion-icon">{criteria.length ? "✓" : "○"}</span>
          <span className="criterion-text">Ít nhất 8 ký tự</span>
        </div>
        <div className={`criterion ${criteria.uppercase ? "met" : ""}`}>
          <span className="criterion-icon">{criteria.uppercase ? "✓" : "○"}</span>
          <span className="criterion-text">Chữ hoa (A-Z)</span>
        </div>
        <div className={`criterion ${criteria.lowercase ? "met" : ""}`}>
          <span className="criterion-icon">{criteria.lowercase ? "✓" : "○"}</span>
          <span className="criterion-text">Chữ thường (a-z)</span>
        </div>
        <div className={`criterion ${criteria.number ? "met" : ""}`}>
          <span className="criterion-icon">{criteria.number ? "✓" : "○"}</span>
          <span className="criterion-text">Số (0-9)</span>
        </div>
        <div className={`criterion ${criteria.specialChar ? "met" : ""}`}>
          <span className="criterion-icon">{criteria.specialChar ? "✓" : "○"}</span>
          <span className="criterion-text">Ký tự đặc biệt (!@#$...)</span>
        </div>
      </div>
    </div>
  );
}
