# Fire Extinguisher Management System (FEMS)

**TZW LTD** — RESTful microservices-based system for managing fire extinguisher inventory, inspections, maintenance, compliance, and reporting.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS, Lucide icons |
| Backend | **Microservices** — Node.js, Express, API Gateway, JWT, Swagger UI |
| Database | MongoDB (shared DB, service-owned collections) |
| Design | Figma mockups (see `docs/FIGMA.md`) |

## Microservices (ports)

| Service | Port |
|---------|------|
| API Gateway | 5000 |
| Auth | 5001 |
| Extinguisher | 5002 |
| Inspection + Maintenance | 5003 |
| Report | 5004 |
| Notification | 5005 |

See `docs/ARCHITECTURE.md` for diagrams and inter-service calls.

## Email OTP (registration & forgot password)

Add SMTP settings to `backend/.env` — see **[docs/SMTP_SETUP.md](docs/SMTP_SETUP.md)**. OTP is sent **only by email** (never shown in the app).

## Quick start (local Node)

```bash
# Backend (starts ALL microservices + gateway)
cd backend && npm install && cp .env.example .env && npm run seed && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

- App: http://localhost:5173  
- API Gateway: http://localhost:5000  
- API docs: http://localhost:5000/api-docs  
- Health (all services): http://localhost:5000/health  

## Docker (data on your PC)

```powershell
cd c:\NE-EXAM\restful\FEMS
docker compose up -d --build
docker compose exec backend npm run seed
```

MongoDB files: `docker-data/mongodb/` (bind mount). Full guide: **[docs/DOCKER.md](docs/DOCKER.md)**.

## Project structure

```
FEMS/
├── backend/
│   ├── gateway/              # API Gateway :5000
│   ├── shared/               # @fems/shared library
│   └── services/             # auth, extinguisher, inspection, report, notification
├── frontend/         # React SPA
├── docs/             # ERD, OpenAPI, deployment, user manual
├── scripts/          # DB backup/restore
└── database/         # Exported backups
```

## Deliverables

- [x] Source code (backend + frontend)
- [x] Swagger documentation (`/api-docs`)
- [x] Database schema & ERD (`docs/ERD.md`)
- [x] UI mockups (Figma — `docs/FIGMA.md`)
- [x] Test results (`docs/TEST_RESULTS.md`)
- [x] Deployment guide (`docs/DEPLOYMENT.md`)
- [x] User manual (`docs/USER_MANUAL.md`)
- [x] PDF/CSV report export
- [x] JWT auth, RBAC, pagination, validation, CORS/security

## Demo accounts

| Email | Password | Role |
|-------|----------|------|
| admin@tzw-ltd.com | Admin@12345 | admin |
| inspector@tzw-ltd.com | Inspector@123 | inspector |
| user@tzw-ltd.com | User@12345 | user |

## License

Academic / examination project for TZW LTD.
