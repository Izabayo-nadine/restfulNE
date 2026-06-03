import nodemailer from 'nodemailer';
import { AppError } from '@fems/shared';

let transporter;

function smtpPass() {
  return (process.env.SMTP_PASS || '').replace(/\s/g, '');
}

function getTransporter() {
  if (transporter) return transporter;
  const user = (process.env.SMTP_USER || '').trim();
  const pass = smtpPass();
  if (process.env.SMTP_HOST && user && pass) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user, pass },
    });
  }
  return transporter;
}

export async function sendOtpEmail({ to, code, purpose }) {
  const subject =
    purpose === 'register'
      ? 'TZW LTD FEMS — Verify your email'
      : 'TZW LTD FEMS — Password reset code';
  const text = `Your verification code is: ${code}\n\nThis code expires in 10 minutes.\n\n— TZW LTD Fire Extinguisher Management System`;

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
      <h2 style="color:#b91c1c;">TZW LTD — FEMS</h2>
      <p>Your verification code is:</p>
      <p style="font-size:28px;font-weight:bold;letter-spacing:6px;color:#0f172a;">${code}</p>
      <p style="color:#64748b;font-size:14px;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
    </div>
  `;

  const transport = getTransporter();
  if (transport) {
    try {
      const from =
        process.env.SMTP_FROM?.trim() ||
        `TZW LTD FEMS <${(process.env.SMTP_USER || '').trim()}>`;
      await transport.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });
      return { emailed: true };
    } catch (err) {
      console.error('[FEMS] SMTP send failed:', err.message);
      const hint =
        process.env.NODE_ENV === 'development'
          ? ` (${err.message})`
          : '';
      throw new AppError(
        `Could not send verification email. Check SMTP settings in backend/.env (Gmail: use App Password, no spaces; SMTP_FROM must match SMTP_USER).${hint}`,
        503
      );
    }
  }
  return { emailed: false };
}

/** Returns true when SMTP is configured in .env */
export function isSmtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER?.trim() && smtpPass());
}
