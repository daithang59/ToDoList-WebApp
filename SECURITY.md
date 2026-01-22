# Security Policy

## 🔒 Reporting a Vulnerability

The security of TodoList WebApp is important to us. If you discover a security vulnerability, please follow these steps:

### 📧 How to Report
1. **DO NOT** open a public issue for security vulnerabilities
2. Email the details to: [your-email@example.com] (replace with your actual email)
3. Include the following information:
   - Type of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### ⏱️ Response Timeline
- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 1-7 days
  - High: 7-14 days
  - Medium: 14-30 days
  - Low: 30-90 days

## 🛡️ Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## 🔐 Security Best Practices

### For Users
- Always use the latest version
- Keep Node.js and dependencies up to date
- Use strong JWT secrets in production
- Enable HTTPS in production
- Review environment variables before deployment

### For Contributors
- Run `npm audit` before submitting PRs
- Never commit sensitive data (API keys, passwords, etc.)
- Use environment variables for configuration
- Follow secure coding practices
- Validate all user inputs
- Sanitize data before storing in database

## 🔍 Known Security Considerations

### Environment Variables
Ensure the following are set securely in production:
- `JWT_SECRET` - Use a strong, random string (minimum 32 characters)
- `SESSION_SECRET` - Use a strong, random string
- `MONGODB_URI` - Use authentication and secure connection
- `CORS_ORIGIN` - Whitelist only trusted domains

### Dependencies
We use:
- `npm audit` - Regular dependency vulnerability scanning
- Dependabot - Automated dependency updates
- Regular security reviews of dependencies

## 📝 Disclosure Policy
We follow responsible disclosure:
1. Security issue is reported privately
2. We investigate and develop a fix
3. Fix is released in a new version
4. Public disclosure after fix is available

## 🏆 Recognition
We appreciate security researchers who help keep our users safe. Contributors who report valid security issues will be:
- Acknowledged in release notes (if desired)
- Listed in our security hall of fame (coming soon)

## 📚 Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

Thank you for helping keep TodoList WebApp and our users safe! 🙏
