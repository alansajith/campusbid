import nodemailer from "nodemailer";

// ─── Lazy transporter — only created on first call ───────────────────────────
let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (_transporter) return _transporter;

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error(
      "GMAIL_USER and GMAIL_APP_PASSWORD environment variables must be set."
    );
  }

  _transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  return _transporter;
}

// ─── Send OTP Email ───────────────────────────────────────────────────────────
export async function sendOtpEmail(
  to: string,
  otp: string,
  university: string
): Promise<void> {
  const transporter = getTransporter();
  const from = process.env.GMAIL_USER!;
  const fromName = process.env.GMAIL_FROM_NAME ?? "CampusBid";

  await transporter.sendMail({
    from: `"${fromName}" <${from}>`,
    to,
    subject: `Your CampusBid verification code: ${otp}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>CampusBid OTP Verification</title>
</head>
<body style="margin:0;padding:0;background:#080b14;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080b14;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
          style="background:#0d1120;border:1px solid rgba(245,167,30,0.2);border-radius:16px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0d1120 0%,#131a30 100%);padding:32px 40px;border-bottom:1px solid rgba(245,167,30,0.15);text-align:center;">
              <span style="font-size:28px;font-weight:900;letter-spacing:-0.5px;">
                <span style="color:#f5a71e;">Campus</span><span style="color:#c5cfe0;">Bid</span>
              </span>
              <p style="margin:8px 0 0;color:#6b7c96;font-size:13px;font-family:sans-serif;letter-spacing:0.1em;text-transform:uppercase;">Student Verification</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="color:#9aabb8;font-size:16px;line-height:1.6;margin:0 0 24px;">
                Hello! Someone (hopefully you) is signing up for <strong style="color:#c5cfe0;">CampusBid</strong> using a <strong style="color:#c5cfe0;">${university}</strong> email address.
              </p>

              <p style="color:#9aabb8;font-size:15px;line-height:1.6;margin:0 0 28px;">
                Enter the code below in the registration form to verify your college identity:
              </p>

              <!-- OTP Box -->
              <div style="background:#0a0e1a;border:1.5px solid rgba(245,167,30,0.35);border-radius:12px;padding:28px;text-align:center;margin:0 0 28px;box-shadow:0 0 30px rgba(245,167,30,0.08);">
                <p style="margin:0 0 8px;color:#6b7c96;font-family:sans-serif;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;">Your Verification Code</p>
                <p style="margin:0;font-size:48px;font-weight:900;letter-spacing:12px;font-family:'Courier New',monospace;color:#f5a71e;text-shadow:0 0 20px rgba(245,167,30,0.4);">${otp}</p>
                <p style="margin:12px 0 0;color:#4a5568;font-family:sans-serif;font-size:12px;">Expires in <strong style="color:#f5a71e;">10 minutes</strong></p>
              </div>

              <p style="color:#6b7c96;font-size:13px;line-height:1.6;margin:0;font-family:sans-serif;">
                If you did not attempt to register on CampusBid, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
              <p style="margin:0;color:#3d4d60;font-family:sans-serif;font-size:12px;">
                &copy; ${new Date().getFullYear()} CampusBid &bull; College-exclusive marketplace &bull; Verified students only
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  });
}
