# MockAPI MERN Catalog

A product catalog app integrating [MockAPI.io](https://mockapi.io) as a real, persistent REST backend — built with an MVC Express backend, TanStack Query on the frontend, and in-memory response caching with proper invalidation.

## Why MockAPI.io (not DummyJSON)

DummyJSON simulates writes — it returns a realistic response but never actually saves anything. MockAPI.io is different: every resource you create there is a **real, persistent REST API** (`GET/POST/PUT/DELETE`) backed by their hosted database. That means:

- No local database needed — MockAPI **is** the data store.
- Create/update/delete genuinely persist and survive refreshes and restarts.
- All the required features (filter/search, delete one/all/selected) work for real, not just cosmetically.

## Stack

- **Backend:** Node.js, Express, Axios, node-cache — MVC pattern
- **Frontend:** React (Vite), TanStack Query, React Router, Axios
- **External API:** [MockAPI.io](https://mockapi.io) (your own project + resource)

## Features

| Feature | Endpoint |
|---|---|
| Create | `POST /api/products` |
| Read (list + search + pagination) | `GET /api/products?search=&page=&limit=` |
| Read by ID | `GET /api/products/:id` |
| Update | `PUT /api/products/:id` |
| Delete one | `DELETE /api/products/:id` |
| Delete all | `DELETE /api/products` |
| Delete selected | `POST /api/products/delete-selected` `{ ids: [...] }` |

## Backend caching — how invalidation is handled

`middleware/cacheMiddleware.js` caches every GET response (list, search, and byId) in `node-cache`, keyed as `products:<full request URL>` — e.g. `products:/api/products?search=phone&page=1`.

**The invalidation rule is deliberately simple and safe:** any write (create, update, delete, delete-all, delete-selected) clears **every** key with the `products:` prefix — `config/cache.js → invalidateProductsCache()`. This runs at the end of every write in `productService.js`.

Why clear everything instead of patching individual keys? A create or delete can change which items appear on *any* list page or *any* search result — trying to selectively patch each cached page is fragile and easy to get subtly wrong. A full-prefix invalidation guarantees the very next GET after a write is always a fresh `MISS` that reflects reality, at the cost of one extra MockAPI round-trip. Given the read/write ratio of a typical catalog UI, that trade-off is the right one.

You can watch this working via the `X-Cache: HIT` / `X-Cache: MISS` response header:
```bash
curl -i http://localhost:5000/api/products        # X-Cache: MISS (first call)
curl -i http://localhost:5000/api/products        # X-Cache: HIT  (cached)
curl -X POST http://localhost:5000/api/products -H "Content-Type: application/json" -d '{"title":"Test"}'
curl -i http://localhost:5000/api/products        # X-Cache: MISS again — cache was invalidated
```

## Project structure

```
mockapi-mern/
├── backend/
│   ├── config/cache.js          # node-cache instance + invalidateProductsCache()
│   ├── services/
│   │   ├── mockApiService.js    # the ONLY file that knows MockAPI's URL shape
│   │   └── productService.js    # business logic + cache invalidation
│   ├── controllers/productController.js
│   ├── routes/productRoutes.js
│   ├── middleware/cacheMiddleware.js, errorHandler.js
│   ├── scripts/seed.js          # one-time script to populate MockAPI with sample data
│   └── server.js
└── frontend/
    └── src/
        ├── api/                 # axiosClient.js, productApi.js
        ├── hooks/useProducts.js # TanStack Query hooks (useQuery/useMutation)
        ├── components/          # ProductList, ProductCard, ProductForm, SearchBar, Modal
        └── pages/               # Home, ProductDetail
```

## Setup

### 1. Create your MockAPI.io resource

1. Go to [mockapi.io](https://mockapi.io) → sign in → **New Project**.
2. Inside the project, click **New Resource**, name it `products`.
3. You don't need to hand-define a schema — the app sends full objects on create, and MockAPI stores whatever fields you send.
4. Copy the endpoint MockAPI shows you, e.g.
   `https://6683af2e1234567890abcde.mockapi.io/api/v1/products`

### 2. Backend

```bash
cd backend
cp .env.example .env
# paste your MockAPI endpoint into MOCKAPI_BASE_URL
npm install
npm run seed        # optional: populates MockAPI with 8 sample products
npm run dev          # nodemon, http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# VITE_API_BASE_URL should point at your backend, e.g. http://localhost:5000/api
npm install
npm run dev          # http://localhost:5173
```

Open `http://localhost:5173`.

### 4. Quick API smoke test (optional)

```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/products
curl "http://localhost:5000/api/products?search=headphones"
curl http://localhost:5000/api/products/1
```

## Deployment

**Backend (Render — free tier):**
1. Push this repo to GitHub.
2. Render → New → Web Service → connect repo → Root directory: `backend`.
3. Build command: `npm install` · Start command: `npm start`.
4. Env vars: `MOCKAPI_BASE_URL`, `CLIENT_ORIGIN` (your deployed frontend URL), `CACHE_TTL_SECONDS`.
5. Deploy — note the URL (e.g. `https://your-app.onrender.com`).

**Frontend (Netlify or Vercel):**
1. New site from Git → Root directory: `frontend`.
2. Build command: `npm run build` · Publish directory: `dist`.
3. Env var: `VITE_API_BASE_URL` = `https://your-app.onrender.com/api`.
4. Deploy.

Update the backend's `CLIENT_ORIGIN` to the frontend's real deployed URL afterward and redeploy the backend so CORS allows it.

## Notes on design choices

- **MVC on the backend:** `controllers/` (thin HTTP layer) → `services/` (business logic + external API + cache invalidation) → `routes/` (wiring). Controllers never touch MockAPI or the cache directly.
- **Delete selected** uses `POST /products/delete-selected` with a JSON body rather than `DELETE` with a body, since request bodies on `DELETE` aren't universally supported by proxies/clients.
- **Delete all / delete selected** loop individual MockAPI delete calls in parallel (`Promise.all` / `Promise.allSettled`) since MockAPI has no native bulk-delete endpoint.
- **TanStack Query** owns all server-state on the frontend: caching, background refetch, and `invalidateQueries` after every mutation so the UI always reflects the latest server state.
