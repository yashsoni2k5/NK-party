require('dotenv').config();
const EmailService = require('./services/email.service');

(async () => {
  try {
    console.log("Testing email with user:", process.env.SMTP_USER);
    await EmailService.sendPasswordResetEmail(process.env.SMTP_USER, 'Test User', '123456', 15);
    console.log("✅ Email sent successfully!");
  } catch (err) {
    console.error("❌ Email failed:");
    console.error(err);
  }
  process.exit();
})();
