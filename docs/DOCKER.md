# FEMS — Docker

Run the full stack in containers while keeping **MongoDB data on your PC** in `docker-data/mongodb/`.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows)
- `backend/.env` configured (copy from `backend/.env.example`)

## Quick start (recommended — Mongo in Docker, data on disk)

```powershell
cd c:\NE-EXAM\restful\FEMS

# Ensure backend/.env exists (JWT, SMTP, etc.)
copy backend\.env.example backend\.env

docker compose up -d --build
docker compose exec backend npm run seed
```

| URL | Service |
|-----|---------|
| http://localhost:5173 | React frontend |
| http://localhost:5000 | API gateway |
| http://localhost:5000/api-docs | Swagger |
| http://localhost:5000/health | All services health |

### Where is my data?

MongoDB files are stored on your machine at:

```
c:\NE-EXAM\restful\FEMS\docker-data\mongodb\
```

- Survives `docker compose down`
- Delete this folder only if you want a **fresh** database
- Port `27017` is exposed so you can also connect with MongoDB Compass: `mongodb://localhost:27017/fems`

## Use your existing local MongoDB instead

If you already have MongoDB on Windows with the `fems` database:

```powershell
docker compose -f docker-compose.host-mongo.yml up -d --build
```

Uses `mongodb://host.docker.internal:27017/fems` — same data as when you run `npm run dev` locally.

## Common commands

```powershell
docker compose ps
docker compose logs -f backend
docker compose restart backend
docker compose down
docker compose down -v   # WARNING: removes mongo volume data only if you used named volumes (we use bind mount — data stays in docker-data/)
```

Re-seed:

```powershell
docker compose exec backend npm run seed
```

## Architecture in Docker

```
Browser → localhost:5173 (frontend/nginx)
        → localhost:5000 (gateway, in backend container)
        → 127.0.0.1:5001–5005 (microservices, same backend container)
        → mongo:27017 or host.docker.internal:27017
```

One **backend** container runs all six Node processes (`npm start`), matching local `npm run dev` networking.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Port 5000 or 27017 in use | Stop local `npm run dev` / local Mongo, or run `backend\npm run kill-ports` |
| Backend unhealthy | `docker compose logs backend` — wait up to 60s on first start |
| Empty app / no users | Run `docker compose exec backend npm run seed` |
| OTP email fails | Set SMTP in `backend/.env`, restart: `docker compose restart backend` |
| Frontend calls wrong API | Rebuild frontend: `docker compose build frontend --no-cache` |

## Files added

- `docker-compose.yml` — mongo + backend + frontend
- `docker-compose.host-mongo.yml` — backend + frontend, PC MongoDB
- `backend/Dockerfile`, `frontend/Dockerfile`, `frontend/nginx.conf`
