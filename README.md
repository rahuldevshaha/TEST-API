# Product Catalog — MERN + MockAPI

A simple product catalog app. Express backend, React frontend, [MockAPI.io](https://mockapi.io) as the persistent data store, with in-memory response caching.

## Stack

- **Backend:** Express, Axios, node-cache
- **Frontend:** React, Vite, React Router, TanStack Query
- **Data store:** MockAPI.io (no local database)

## Features

- Product listing with search, pagination, and create/edit/delete
- Bulk selection and delete
- In-memory GET caching with automatic invalidation on writes
- Product detail page

## Project structure

```
backend/
  config/          # cache setup
  controllers/      # route handlers
  middleware/        # caching, error handling
  routes/            # API routes
  services/           # business logic + MockAPI client
  scripts/            # seed script
  server.js
  Dockerfile

frontend/
  src/
    api/            # axios client + product API calls
    components/      # UI components
    hooks/            # React Query hooks
    pages/            # route pages
    asset/css/        # styles
  Dockerfile
  nginx.conf

docker-compose.yml
```

## Setup (local, without Docker)

### 1. MockAPI

Create a `products` resource at [mockapi.io](https://mockapi.io) and copy its base URL.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # add your MOCKAPI_BASE_URL
npm run seed           # optional: populate sample products
npm run dev
```

Runs on `http://localhost:5000`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`.

## Setup (Docker)

Requires Docker and Docker Compose.

1. Create `backend/.env` (see [Environment variables](#environment-variables) below).
2. If your backend will run somewhere other than `http://localhost:5000`, update `VITE_API_BASE_URL` under the `frontend` build args in `docker-compose.yml` — Vite bakes this in at build time.
3. Run:

```bash
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

To seed sample products into a running backend container:

```bash
docker compose exec backend npm run seed
```

Stop everything with `docker compose down`.

## Environment variables

**backend/.env**

```
PORT=5000
MOCKAPI_BASE_URL=https://<your-mockapi-id>.mockapi.io/api/v1/products
CLIENT_ORIGIN=http://localhost:5173
CACHE_TTL_SECONDS=60
PRODUCT_DEFAULT_THUMB=https://placehold.co/300x300?text=%20
```

**frontend/.env** (local dev only — ignored by the Docker build, which uses the compose build arg instead)

```
VITE_API_BASE_URL=http://localhost:5000/api
```

## API

| Method | Endpoint                        | Description               |
|--------|----------------------------------|----------------------------|
| GET    | `/api/products`                  | List (search, page, limit) |
| GET    | `/api/products/:id`               | Get one                    |
| POST   | `/api/products`                   | Create                      |
| PUT    | `/api/products/:id`               | Update                      |
| DELETE | `/api/products/:id`               | Delete one                  |
| POST   | `/api/products/delete-selected`   | Bulk delete (`{ ids: [] }`)  |
