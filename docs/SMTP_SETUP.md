# Configure SMTP (send OTP to email)

FEMS sends **6-digit OTP codes only by email** for:

- User registration verification
- Forgot password reset

If SMTP is not configured, registration will return an error and **no OTP is shown in the app**.

## Where to configure

Edit this file:

```
c:\NE-EXAM\restful\FEMS\backend\.env
```

Add these lines (copy from `.env.example`):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-here
SMTP_FROM="TZW LTD FEMS <your-email@gmail.com>"
```

Restart the backend after saving:

```powershell
cd c:\NE-EXAM\restful\FEMS\backend
npm run dev
```

## Gmail (recommended for testing)

1. Use a Google account with **2-Step Verification** turned on.
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords).
3. Create an app password for **Mail** / **Other (FEMS)**.
4. Copy the **16-character** password into `SMTP_PASS` (no spaces).
5. Set `SMTP_USER` to your full Gmail address.

Example:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=izabayonadine08@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_FROM="TZW LTD FEMS <your-email@gmail.com>"
```

Use the 16-character app password **without spaces**. `SMTP_USER` and the address inside `SMTP_FROM` must be the **same** Gmail account.

Test SMTP from the backend folder:

```powershell
cd c:\NE-EXAM\restful\FEMS\backend
npm run kill-ports
node scripts/test-smtp.js your-email@gmail.com
```

## Outlook / Microsoft 365

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=you@company.com
SMTP_PASS=your-password-or-app-password
SMTP_FROM="TZW LTD FEMS <you@company.com>"
```

## Verify it works

1. Restart `npm run dev` in `backend`.
2. Open http://localhost:5173/register
3. Use **your real email** in the form.
4. Click **Send verification code to my email**.
5. Check **Inbox** and **Spam** for subject: `TZW LTD FEMS — Verify your email`.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Email could not be sent" | Add all SMTP_* vars to `backend/.env` and restart backend |
| Gmail "Less secure app" | Use an **App Password**, not your normal Gmail password |
| 503 / SMTP send failed | Wrong `SMTP_PASS`, firewall blocking port 587, or typo in `SMTP_USER` |
| `535 Username and Password not accepted` | Create a **new** Gmail App Password for the **same** address as `SMTP_USER`; remove spaces from `SMTP_PASS` |
| Gmail rejects sender | `SMTP_FROM` must use the **same** email as `SMTP_USER` (e.g. both `you@gmail.com`) |
| `EADDRINUSE` on 5001–5005 | Stop old backend: `npm run kill-ports` in `backend`, then `npm run dev` once |
| No email but no error | Check spam; wait 1–2 minutes |

OTP codes are **never** returned in the API or shown on screen when SMTP is configured correctly.
