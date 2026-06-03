/**
 * Quick SMTP check: node scripts/test-smtp.js [recipient-email]
 * Loads backend/.env and verifies Gmail (or other) credentials.
 */
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const user = (process.env.SMTP_USER || '').trim();
const pass = (process.env.SMTP_PASS || '').replace(/\s/g, '');
const to = process.argv[2] || user;

if (!process.env.SMTP_HOST || !user || !pass) {
  console.error('Missing SMTP_HOST, SMTP_USER, or SMTP_PASS in backend/.env');
  process.exit(1);
}

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user, pass },
});

try {
  await transport.verify();
  console.log('SMTP connection OK');
  const info = await transport.sendMail({
    from: process.env.SMTP_FROM?.trim() || `TZW LTD FEMS <${user}>`,
    to,
    subject: 'FEMS SMTP test',
    text: 'If you received this, SMTP is configured correctly.',
  });
  console.log('Test email sent:', info.messageId);
} catch (err) {
  console.error('SMTP failed:', err.message);
  process.exit(1);
}
