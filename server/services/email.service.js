const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASSWORD, 
  },
});

const EmailService = {
  sendVerificationEmail: async (email, name, otp, expiresInMinutes = 10) => {
    try {
      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'Meesho Clone'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: "Verify your email address",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
            <h2 style="color: #4A0E22; text-align: center;">Email Verification</h2>
            <p>Hello ${name ? name : 'User'},</p>
            <p>Thank you for registering. Please use the following One-Time Password (OTP) to verify your email address. This OTP is valid for <strong>${expiresInMinutes} minutes</strong>.</p>
            <div style="background-color: #F2DCD8; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0;">
              <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #3D0B1C;">${otp}</span>
            </div>
            <p style="color: #666; font-size: 14px;"><strong>Security Warning:</strong> Do not share this OTP with anyone. Our team will never ask for your OTP.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending verification email:", error);
      throw new Error("Unable to send verification email. Please try again.");
    }
  },

  sendPasswordResetEmail: async (email, name, otp, expiresInMinutes = 15) => {
    try {
      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'Meesho Clone'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: "Password Reset OTP",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
            <h2 style="color: #4A0E22; text-align: center;">Password Reset Request</h2>
            <p>Hello ${name ? name : 'User'},</p>
            <p>We received a request to reset your password. Please use the following OTP to complete the process. This OTP is valid for <strong>${expiresInMinutes} minutes</strong>.</p>
            <div style="background-color: #F2DCD8; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0;">
              <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #3D0B1C;">${otp}</span>
            </div>
            <p style="color: #666; font-size: 14px;">If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw new Error("Unable to send password reset email. Please try again.");
    }
  }
};

module.exports = EmailService;
