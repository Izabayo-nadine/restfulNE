# FEMS Deployment Guide

## Prerequisites

- Node.js 18+
- MongoDB 6+ (local or Atlas)
- npm

## 1. Clone and configure

```bash
cd FEMS/backend
cp .env.example .env
# Edit .env: MONGODB_URI, JWT_SECRET, FRONTEND_URL
```

```bash
cd ../frontend
# Optional: create .env with VITE_API_URL=http://localhost:5000/api/v1
```

## 2. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

## 3. Seed database (optional)

```bash
cd backend
npm run seed
```

Demo accounts:
- admin@tzw-ltd.com / Admin@12345
- inspector@tzw-ltd.com / Inspector@123
- user@tzw-ltd.com / User@12345

## 4. Run development (microservices)

One command starts the gateway and all five services:

```bash
cd backend
npm run dev
```

Terminal 2 (frontend):
```bash
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- API Gateway: http://localhost:5000
- Swagger UI: http://localhost:5000/api-docs
- Aggregated health: http://localhost:5000/health

Individual services (optional debugging):
```bash
npm run dev -w @fems/auth-service
npm run dev -w @fems/api-gateway
```

## 5. Production build

```bash
cd frontend && npm run build
# Serve dist/ with nginx or static host; set VITE_API_URL to production API
```

```bash
cd backend
NODE_ENV=production npm start
```

## 6. Database backup

```bash
# From project root (requires mongodump)
MONGODB_URI=mongodb://127.0.0.1:27017/fems node scripts/backup-db.js
```

Restore:
```bash
node scripts/restore-db.js database/backups/backup-<timestamp>/fems
```

## 7. Push to repository

```bash
git init
git add .
git commit -m "FEMS: RESTful microservices fire extinguisher management system"
git remote add origin <your-repo-url>
git push -u origin main
```

## Health check

`GET http://localhost:5000/health`

## 8. Docker

See **[DOCKER.md](./DOCKER.md)** for `docker compose up`, local data volume `docker-data/mongodb`, and using existing Windows MongoDB.
