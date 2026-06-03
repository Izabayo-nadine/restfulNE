# FEMS Testing Guide

## Prerequisites

1. MongoDB running locally.
2. Backend: `cd backend` → `npm run kill-ports` → `npm run dev`
3. Frontend: `cd frontend` → `npm run dev`
4. Seed demo users: `cd backend` → `npm run seed`

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@tzw-ltd.com | Admin@12345 |
| Inspector | inspector@tzw-ltd.com | Inspector@123 |
| User | user@tzw-ltd.com | User@12345 |

Swagger: http://localhost:5000/api-docs

---

## 1. Schedule inspection API (all facility users)

**Endpoint:** `POST /api/v1/inspections`  
**Auth:** Bearer token (admin, inspector, or user)

**Body:**
```json
{
  "fireExtinguisher": "<mongoId>",
  "inspectionDate": "2026-06-10T12:00:00.000Z",
  "inspectionTime": "09:00",
  "assignedInspector": "<optional inspector mongoId>"
}
```

**UI test (facility user):**
1. Login as **user@tzw-ltd.com**.
2. **Extinguishers** — view status, location, expiry (read-only, no Actions column).
3. **Inspections** → **Schedule inspection** — pick unit, future date/time.
4. Table shows serial/location; **Next step** column shows “Awaiting inspector” (users cannot complete inspections).

**UI test (admin):**
1. Login as **admin** or schedule as user, then:
2. Go to **Inspections** → **Schedule inspection**.
3. Select extinguisher, **today or future date**, time → **Schedule**.
4. Expect success and row in the inspections table.

**Notifications created:**
- All **inspectors** and **admins** → “New Inspection Scheduled”
- **Scheduler** → “Inspection scheduled” confirmation

**Verify notifications (inspector):**
1. Login as **inspector@tzw-ltd.com**.
2. Sidebar **Notifications** (badge if unread).
3. You should see the inspection alert (same `recipient` as this user’s `_id` in MongoDB).

**Swagger:** Authorize with inspector token → try `GET /api/v1/notifications`.

---

## 2. Log maintenance API (inspectors / admin)

**Endpoint:** `POST /api/v1/maintenance`  
**Auth:** Bearer token (inspector or admin only)

**Body:**
```json
{
  "fireExtinguisher": "<mongoId>",
  "actionTaken": "Replaced pressure gauge seal",
  "maintenanceDate": "2026-06-03T12:00:00.000Z",
  "issuesIdentified": "Minor corrosion on bracket; gauge in green zone",
  "notesAndRecommendations": "Re-check in 30 days"
}
```

(`conditionNoted` is accepted as an alias for `issuesIdentified`.)

**UI test:**
1. Login as **inspector**.
2. **Maintenance** → **Log maintenance**.
3. Fill extinguisher, action, date, **condition noted during maintenance** → **Save**.
4. Facility user who registered that extinguisher gets a notification (if `registeredBy` is set).

---

## 3. In-app notifications

**Endpoints:**
- `GET /api/v1/notifications?page=1&limit=10`
- `GET /api/v1/notifications/unread-count`
- `PATCH /api/v1/notifications/{id}/read`
- `PATCH /api/v1/notifications/read-all`

**If DB has rows but UI was empty:** ensure you are logged in as the **same user** as `recipient` on the notification document. Inspectors only see notifications addressed to their user id.

**MongoDB check:**
```javascript
db.notifications.find().pretty()
// recipient should match users._id for inspector account
```

---

## 4. Report export (CSV & PDF table)

**Endpoint:** `GET /api/v1/reports/export?type={inventory|inspection|compliance|maintenance}&format={csv|pdf}`  
**Auth:** admin or inspector

**UI test:**
1. Login as **admin** or **inspector**.
2. **Reports** → choose tab (e.g. Inventory).
3. Click **CSV** → opens spreadsheet with header row + data.
4. Click **PDF** → downloads PDF with **table** (column headers + rows), not plain JSON.

**curl example:**
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:5000/api/v1/reports/export?type=inventory&format=pdf" \
  --output inventory.pdf
```

---

## 5. Quick API checklist

| Feature | Method | Path | Roles |
|---------|--------|------|-------|
| Schedule inspection | POST | `/inspections` | admin, inspector, user |
| List inspections | GET | `/inspections` | authenticated |
| Complete inspection | PATCH | `/inspections/:id/complete` | inspector, admin |
| Log maintenance | POST | `/maintenance` | inspector, admin |
| List maintenance | GET | `/maintenance` | authenticated |
| Export report | GET | `/reports/export` | admin, inspector |
| Notifications | GET | `/notifications` | authenticated |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Inspector sees no notifications | Login as inspector; confirm `recipient` in `notifications` collection matches that user’s `_id` |
| Schedule fails “extinguisher not found” | Restart backend after `kill-ports`; ensure extinguisher service internal routes run before JWT routes |
| Validation failed on date | Use future date `YYYY-MM-DD` in UI (auto-converted to ISO) |
| Export 401 | Use admin/inspector token |
| Port in use | `npm run kill-ports` in `backend` |
| **504** when scheduling inspection | Inspection service crashed — check terminal for `[insp] Failed running`. Run `npm run kill-ports` then `npm run dev`; confirm line `Inspection service http://localhost:5003` |
