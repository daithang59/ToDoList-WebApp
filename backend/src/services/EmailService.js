import nodemailer from "nodemailer";

/**
 * Email Service for sending authentication-related emails
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.from = process.env.EMAIL_FROM || '"ToDoList App" <noreply@todolist.app>';
  }

  /**
   * Initialize email transporter
   */
  async initialize() {
    if (this.transporter) {
      return; // Already initialized
    }

    try {
      // Create transporter
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT || "587"),
        secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      // Verify connection
      await this.transporter.verify();
      console.log("✓ Email service is ready");
    } catch (error) {
      console.error("✗ Email service failed to initialize:", error.message);
      // Don't throw - allow app to run even if email is not configured
      // Just log errors when trying to send
    }
  }

  /**
   * Send email with error handling
   */
  async sendMail(mailOptions) {
    if (!this.transporter) {
      await this.initialize();
    }

    if (!this.transporter) {
      throw new Error(
        "Email service is not configured. Please set EMAIL_HOST, EMAIL_USER, and EMAIL_PASSWORD in environment variables."
      );
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        ...mailOptions,
      });
      console.log("✓ Email sent:", info.messageId);
      return info;
    } catch (error) {
      console.error("✗ Failed to send email:", error.message);
      throw new Error("Failed to send email. Please try again later.");
    }
  }

  /**
   * Send email verification email
   * @param {object} user - User object with email and name
   * @param {string} token - Verification token
   */
  async sendVerificationEmail(user, token) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    const mailOptions = {
      to: user.email,
      subject: "Xác thực email của bạn - ToDoList App",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Chào mừng đến với ToDoList App!</h1>
            </div>
            <div class="content">
              <p>Xin chào <strong>${user.name}</strong>,</p>
              
              <p>Cảm ơn bạn đã đăng ký tài khoản! Để hoàn tất quá trình đăng ký, vui lòng xác thực địa chỉ email của bạn bằng cách nhấp vào nút bên dưới:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Xác thực Email</a>
              </div>
              
              <div class="warning">
                <strong>⏱️ Lưu ý:</strong> Link này sẽ hết hạn sau 24 giờ.
              </div>
              
              <p>Nếu nút không hoạt động, bạn có thể sao chép và dán link sau vào trình duyệt:</p>
              <p style="word-break: break-all; background: white; padding: 10px; border-radius: 5px;">
                <a href="${verificationUrl}">${verificationUrl}</a>
              </p>
              
              <p>Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.</p>
              
              <p>Trân trọng,<br><strong>ToDoList Team</strong></p>
            </div>
            <div class="footer">
              <p>Email này được gửi tự động, vui lòng không trả lời.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Chào ${user.name},

        Cảm ơn bạn đã đăng ký tài khoản ToDoList App!

        Để xác thực email của bạn, vui lòng truy cập link sau:
        ${verificationUrl}

        Link này sẽ hết hạn sau 24 giờ.

        Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.

        Trân trọng,
        ToDoList Team
      `,
    };

    return this.sendMail(mailOptions);
  }

  /**
   * Send password reset email
   * @param {object} user - User object with email and name
   * @param {string} token - Reset token
   */
  async sendPasswordResetEmail(user, token) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    const mailOptions = {
      to: user.email,
      subject: "Yêu cầu đặt lại mật khẩu - ToDoList App",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 15px 0; }
            .alert { background: #f8d7da; border-left: 4px solid #dc3545; padding: 12px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Đặt lại mật khẩu</h1>
            </div>
            <div class="content">
              <p>Xin chào <strong>${user.name}</strong>,</p>
              
              <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhấp vào nút bên dưới để tạo mật khẩu mới:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Đặt lại mật khẩu</a>
              </div>
              
              <div class="warning">
                <strong>⏱️ Lưu ý:</strong> Link này sẽ hết hạn sau 1 giờ.
              </div>
              
              <div class="alert">
                <strong>🔒 Bảo mật:</strong> Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Mật khẩu của bạn sẽ không bị thay đổi.
              </div>
              
              <p>Nếu nút không hoạt động, bạn có thể sao chép và dán link sau vào trình duyệt:</p>
              <p style="word-break: break-all; background: white; padding: 10px; border-radius: 5px;">
                <a href="${resetUrl}">${resetUrl}</a>
              </p>
              
              <p>Trân trọng,<br><strong>ToDoList Team</strong></p>
            </div>
            <div class="footer">
              <p>Email này được gửi tự động, vui lòng không trả lời.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Xin chào ${user.name},

        Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.

        Để đặt lại mật khẩu, vui lòng truy cập link sau:
        ${resetUrl}

        Link này sẽ hết hạn sau 1 giờ.

        Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.

        Trân trọng,
        ToDoList Team
      `,
    };

    return this.sendMail(mailOptions);
  }

  /**
   * Send password changed notification
   * @param {object} user - User object with email and name
   */
  async sendPasswordChangedEmail(user) {
    const mailOptions = {
      to: user.email,
      subject: "Mật khẩu đã được thay đổi - ToDoList App",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .alert { background: #d1ecf1; border-left: 4px solid #0c5460; padding: 12px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Mật khẩu đã được cập nhật</h1>
            </div>
            <div class="content">
              <p>Xin chào <strong>${user.name}</strong>,</p>
              
              <p>Đây là email thông báo rằng mật khẩu cho tài khoản của bạn đã được thay đổi thành công.</p>
              
              <div class="alert">
                <strong>🔒 Bảo mật:</strong> Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ với chúng tôi ngay lập tức.
              </div>
              
              <p>Nếu bạn thực hiện thay đổi này, bạn có thể bỏ qua email này.</p>
              
              <p>Trân trọng,<br><strong>ToDoList Team</strong></p>
            </div>
            <div class="footer">
              <p>Email này được gửi tự động, vui lòng không trả lời.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Xin chào ${user.name},

        Mật khẩu cho tài khoản của bạn đã được thay đổi thành công.

        Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ với chúng tôi ngay lập tức.

        Trân trọng,
        ToDoList Team
      `,
    };

    return this.sendMail(mailOptions);
  }
}

// Export singleton instance
const emailService = new EmailService();
export default emailService;
