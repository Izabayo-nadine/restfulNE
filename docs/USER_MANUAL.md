# FEMS User Manual — TZW LTD

## Getting started

1. Open the application URL (default: http://localhost:5173).
2. **Register** with first name, last name, email, and a strong password, or use a demo account from the deployment guide.
3. After login you land on the **Dashboard** with live counts.

## Roles and account creation

| Role | How the account is created |
|------|----------------------------|
| **Admin** | Seeded at setup (`npm run seed`) — e.g. `admin@tzw-ltd.com` |
| **User** | Self-registration on the public **Register** page (always role `user`) |
| **Inspector** | Created by an **admin** under **Users → Register inspector** |

| Role | Capabilities |
|------|----------------|
| **User** | View extinguishers, schedule inspections, view history, profile |
| **Inspector** | Register/edit extinguishers, complete inspections, log maintenance, reports export |
| **Admin** | Full access + delete extinguishers, register inspectors, manage users, export reports |

## Fire extinguishers

- Browse paginated list; search by serial or location.
- Admins/inspectors: **Add extinguisher** with serial, location, type, size, dates, status.
- Admins: **Delete** (confirmation required).

## Inspections

- **Schedule**: pick extinguisher, date, and time. Inspectors receive notifications.
- Inspectors mark inspections **Complete** with result and notes.

## Maintenance

- Inspectors log action taken, date, issues, and recommendations.

## Reports

- Tabs: Inventory (daily/monthly/yearly), Inspections, Compliance, Maintenance.
- Admins/inspectors: export **CSV** or **PDF**.

## Profile & security

- Update name/email; change password.
- **Registration OTP**: after filling the form, a 6-digit code is sent to your email (configure SMTP in `backend/.env` — see `docs/SMTP_SETUP.md`).
- **Forgot password**: request OTP by email, then enter code + new password on the same flow.
- **Logout**: confirm in dialog.

## Role dashboards

- **Admin**: full KPIs, user management, compliance, data integrity shortcuts.
- **Inspector**: inspection workload, maintenance logging, extinguisher access.
- **User**: extinguisher status overview and inspection scheduling only (no maintenance or reports menus).

## Notifications

- **Inspectors & admins** receive alerts when an inspection is scheduled.
- **Facility users** receive alerts when maintenance is logged on their extinguisher.
- Open **Notifications** in the sidebar (red badge = unread count).
- See **docs/TESTING_GUIDE.md** for API and export testing steps.
