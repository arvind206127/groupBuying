const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendOTPEmail = async (email, otp, name) => {
  // In development, just log it
  if (process.env.NODE_ENV === 'development') {
    console.log(`\n📧 ===== OTP EMAIL (DEV MODE) =====`);
    console.log(`   To: ${email}`);
    console.log(`   Name: ${name || 'User'}`);
    console.log(`   OTP: ${otp}`);
    console.log(`   Valid for: ${process.env.OTP_EXPIRY_MINUTES || 10} minutes`);
    console.log(`===================================\n`);
    return { success: true, devMode: true };
  }

  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: 'Your Real Togather Login OTP',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your OTP - Real Togather</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Real Togather</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Buy Together, Save Together</p>
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="color: #1a1a2e; margin: 0 0 12px; font-size: 22px;">Hello, ${name || 'Welcome'}! 👋</h2>
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
              Your One-Time Password (OTP) for logging into Real Togather is:
            </p>
            <div style="background: linear-gradient(135deg, #667eea20, #764ba220); border: 2px dashed #667eea; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 30px;">
              <span style="font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #667eea;">${otp}</span>
            </div>
            <p style="color: #ef4444; font-size: 14px; background: #fee2e2; padding: 12px 16px; border-radius: 8px; margin: 0 0 20px;">
              ⏱️ This OTP expires in <strong>${process.env.OTP_EXPIRY_MINUTES || 10} minutes</strong>. Do not share it with anyone.
            </p>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
              If you didn't request this OTP, please ignore this email. Your account is safe.
            </p>
          </div>
          <div style="background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © 2024 Real Togather. All rights reserved.<br>
              <a href="mailto:hello@realtogather.com" style="color: #667eea; text-decoration: none;">hello@realtogather.com</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    throw new Error('Failed to send email');
  }
};

module.exports = { sendOTPEmail };
