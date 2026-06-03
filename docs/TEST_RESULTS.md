# API Test Results

## Manual test checklist

| Endpoint | Method | Expected | Status |
|----------|--------|----------|--------|
| /health | GET | 200 OK | Pass |
| /auth/register | POST | 201 + validation errors on bad input | Pass |
| /auth/login | POST | 200 + JWT | Pass |
| /auth/profile | GET | 200 with Bearer token | Pass |
| /extinguishers | GET | Paginated list | Pass |
| /extinguishers | POST | 201 (inspector/admin) | Pass |
| /extinguishers/:id | DELETE | 403 for user, 200 admin | Pass |
| /inspections | POST | 201 + notifications | Pass |
| /maintenance | POST | 201 (inspector) | Pass |
| /reports/inventory | GET | Aggregated stats | Pass |
| /reports/export?format=csv | GET | File download | Pass |
| Duplicate email register | POST | 409 Conflict | Pass |
| Invalid MongoDB id | GET | 400 Bad Request | Pass |
| No token on protected route | GET | 401 Unauthorized | Pass |

## Security tests

- CORS: only `FRONTEND_URL` origin allowed
- Rate limit: auth routes limited to 20/15min
- Passwords never returned in API responses
- JWT required on all `/api/v1/*` except auth register/login/forgot/reset

## Tools

Use Swagger UI at `/api-docs` or import `docs/openapi.yaml` into Postman.

Run automated smoke test after starting server:

```bash
curl http://localhost:5000/health
```
