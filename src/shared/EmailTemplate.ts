export const emailBody = (userName: string, otp: string) => {
 const html = `
  <div style="font-family: 'Segoe UI', Roboto, Arial, sans-serif; background: linear-gradient(135deg, #ff6ec4, #7873f5); padding: 50px 20px; color: #ffffff;">
    <div style="max-width: 600px; margin: auto; background: #1f1f2e; border-radius: 16px; padding: 40px; box-shadow: 0 0 20px rgba(255,255,255,0.1); color: #ffffff;">
      
      <div style="text-align: center;">
        <img src="https://img.icons8.com/fluency/96/lock--v1.png" alt="Secure Icon" width="64" style="margin-bottom: 16px;" />
        <h1 style="font-size: 30px; "color: white"; font-weight: bold; margin-bottom: 10px;">Verify Your Identity</h1>
        <p style="font-size: 16px; color: #ddd;">Use the OTP below to continue securely</p>
      </div>

      <div style="text-align: center; margin: 40px 0;">
        <span style="display: inline-block; background: linear-gradient(135deg, #ff9a8b, #ff6a88, #ff99ac); color: white; font-size: 36px; font-weight: 800; padding: 20px 40px; border-radius: 12px; letter-spacing: 6px; box-shadow: 0 8px 24px rgba(255,106,136,0.4);">
          ${otp}
        </span>
      </div>

      <p style="font-size: 16px; color: #ccc; text-align: center;">
        Hello <strong>${userName}</strong>, your one-time password is valid for <strong>5 minutes</strong>.
        Never share this with anyone—even if they say they're from our team.
      </p>

      <div style="text-align: center; margin-top: 40px;">
        <a href="#" style="display: inline-block; background: linear-gradient(90deg, #12c2e9, #c471ed, #f64f59); color: white; padding: 14px 30px; font-size: 16px; font-weight: 600; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 20px rgba(246, 79, 89, 0.5);">
          Verify Account
        </a>
      </div>

      <p style="margin-top: 50px; text-align: center; font-size: 13px; color: #aaa;">
        Didn't request this OTP? No problem — just ignore this email.
      </p>

    </div>

    <p style="text-align: center; font-size: 12px; color: #f1f1f1; margin-top: 30px;">
      © ${new Date().getFullYear()} Your Vibrant App. All rights reserved.
    </p>
  </div>
`;
  return html;
};
