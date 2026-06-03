# FEMS Microservices Architecture

## Overview

FEMS runs as **six independent Node.js processes** behind one **API Gateway**. The React frontend only talks to the gateway (`http://localhost:5000/api/v1`).

```
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │      :5173          │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   API Gateway       │
                    │      :5000          │
                    │  (reverse proxy)    │
                    └──┬──┬──┬──┬──┬──────┘
         ┌─────────────┘  │  │  │  └─────────────┐
         ▼                ▼  ▼  ▼                ▼
   ┌──────────┐   ┌──────────┐ ┌──────────┐ ┌──────────┐
   │   Auth   │   │Extinguisher│ │Inspection│ │  Report  │
   │  :5001   │   │  :5002   │ │  :5003   │ │  :5004   │
   └────┬─────┘   └────┬─────┘ └────┬─────┘ └────┬─────┘
        │              │            │            │
        │         HTTP (internal)   │            │
        │              └────────────┼────────────┘
        │                           ▼
        │                    ┌──────────────┐
        └───────────────────►│ Notification │
                             │    :5005     │
                             └──────┬───────┘
                                    ▼
                             ┌──────────────┐
                             │   MongoDB    │
                             │    (fems)    │
                             └──────────────┘
```

## Microservices

| Service | Port | Responsibility |
|---------|------|----------------|
| **API Gateway** | 5000 | Routing, CORS, rate limit, Swagger, health aggregation |
| **Auth Service** | 5001 | Register, login, JWT, profile, user admin |
| **Extinguisher Service** | 5002 | Fire extinguisher CRUD |
| **Inspection Service** | 5003 | Inspections + maintenance logging |
| **Report Service** | 5004 | Inventory, compliance, export PDF/CSV |
| **Notification Service** | 5005 | In-app notifications |

## Inter-service communication

- **Inspection → Extinguisher**: `GET /internal/extinguishers/:id` (validates extinguisher exists)
- **Inspection → Notification**: `POST /internal/notify` (notify inspectors on schedule)
- **Notification → Auth**: `GET /api/v1/auth/internal/users/role/:role` (resolve recipient IDs)

Internal calls use header `X-Internal-Key` matching `INTERNAL_SERVICE_KEY`.

## Shared package (`@fems/shared`)

Logger, JWT middleware, pagination, DB connect, HTTP clients for cross-service calls.

## JWT across services

Tokens include `id`, `role`, and `email`. Each service validates JWT locally without calling Auth on every request.

## Run all services

```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

## Health check

`GET http://localhost:5000/health` — returns status of every microservice.
