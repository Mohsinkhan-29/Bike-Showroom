# Architecture — S.M. Autos Bike Showroom

## 1. High-Level Architecture

The system follows a classic **three-tier architecture**, split into two deployable applications that talk over a REST API, plus an external AI service for the chatbot.

```
┌─────────────────────────┐        REST/JSON over HTTPS        ┌──────────────────────────┐
│        FRONTEND         │ ───────────────────────────────────▶│         BACKEND          │
│   React + Vite + Router │◀─────────────────────────────────── │  Node.js + Express API   │
│   (Public site + Admin) │                                      │                          │
└─────────────────────────┘                                      └────────────┬─────────────┘
                                                                                │
                                              ┌─────────────────────────────────┼──────────────────────────┐
                                              │                                 │                          │
                                     ┌────────▼────────┐               ┌────────▼────────┐        ┌────────▼────────┐
                                     │  Neon PostgreSQL │               │   Google Gemini  │        │  Local file      │
                                     │  (bikes, leads,   │               │   Embedding +    │        │  uploads (bike   │
                                     │   rag_chunks, ...)│               │   Chat API       │        │  images / docs)  │
                                     └───────────────────┘               └──────────────────┘        └──────────────────┘
```

- The **frontend** never talks to Postgres or Gemini directly — everything goes through the backend API.
- The **backend** is the single source of truth: it enforces auth, validates input, talks to the database, and orchestrates calls to the Gemini API for the chatbot.
- **Gemini** is used purely as a stateless text/embedding generator — no conversation state or documents are stored on Google's side; the app manages all persistence itself in Postgres.

---

## 2. Backend Architecture (layered)

The backend follows a standard **routes → controllers → utils/db** layering, typical of an MVC-style Express API without the "view" layer (the frontend is the view):

```
server.js                 → app bootstrap: CORS, JSON body parsing, rate limiting, route mounting
 │
 ├── routes/               → one router per resource, maps HTTP verb + path → controller function
 │     ├── auth.routes.js
 │     ├── bikes.routes.js
 │     ├── leads.routes.js
 │     ├── recommend.routes.js
 │     ├── dashboard.routes.js
 │     ├── chat.routes.js
 │     └── rag.routes.js
 │
 ├── controllers/          → request handling + business logic per resource
 │     ├── auth.controller.js         (admin login, session check)
 │     ├── bikes.controller.js        (catalog CRUD, image upload)
 │     ├── leads.controller.js        (capture + list inquiries)
 │     ├── recommend.controller.js    (scoring engine for bike matching)
 │     ├── dashboard.controller.js    (aggregated KPIs for admin analytics)
 │     ├── chat.controller.js         (RAG-grounded chatbot endpoint)
 │     └── rag.controller.js          (knowledge-base document management)
 │
 ├── middleware/
 │     ├── auth.js                    (JWT verification, admin-role gate)
 │     └── errorHandler.js            (centralized error + 404 handling)
 │
 ├── utils/
 │     ├── gemini.js                  (thin fetch-based wrapper over Gemini's embed + chat APIs)
 │     ├── rag.js                     (chunking + cosine-similarity ranking — the retrieval logic)
 │     ├── jwt.js                     (token sign/verify)
 │     └── format.js                  (shared formatting helpers, e.g. currency)
 │
 ├── config/env.js          → centralized, validated environment configuration
 ├── db.js                  → Neon Postgres connection pool + query helper/logger
 └── scripts/
       ├── migrate.js        → idempotent schema creation (CREATE TABLE IF NOT EXISTS)
       └── seed.js           → sample data loader
```

**Request flow example — the chatbot:**
1. Frontend `ChatWidget` sends the rider's message + running conversation history to `POST /api/chat`.
2. `chat.controller.js` embeds the question via Gemini, fetches all stored `rag_chunks`, and ranks them by cosine similarity (`utils/rag.js`) to find the most relevant showroom documents.
3. It also pulls a live snapshot of the active catalog straight from Postgres.
4. Both pieces are assembled into a system instruction and sent to Gemini's chat model along with conversation history.
5. The reply, plus the list of document sources actually used, is returned to the frontend.

**Request flow example — admin catalog update:**
1. Frontend sends the request with a `Bearer` JWT in the `Authorization` header.
2. `middleware/auth.js` verifies the token and attaches the decoded user; `requireAdmin` checks the role.
3. `bikes.controller.js` performs the database write and returns the updated record.

---

## 3. Frontend Architecture

```
src/
 ├── main.jsx              → app entry point, mounts <App /> with routing/context providers
 ├── App.jsx                → route table (public routes, admin login, protected admin routes)
 ├── context/
 │     └── AuthContext.jsx  → holds the JWT/admin session, exposed via a React context
 ├── api/
 │     ├── client.js        → configured Axios instance (base URL, auth header injection)
 │     ├── bikes.js         → bike-related API calls
 │     └── rag.js           → knowledge-base API calls
 ├── pages/                 → route-level views (Home, Catalog, BikeDetail, Recommend, About, Contact)
 │     └── admin/           → admin-only views (Dashboard, Catalog, BikeForm, Leads, Rag manager, Login)
 ├── components/            → reusable UI pieces (Navbar, Footer, BikeCard, SpecPlate, ChatWidget, ProtectedRoute, ...)
 └── utils/format.js        → shared display formatting (currency, etc.)
```

- **`ProtectedRoute`** guards the `/admin/*` routes, redirecting to `/admin/login` if no valid session is present.
- **`AuthContext`** centralizes login state so any component can read "is an admin logged in" without prop-drilling.
- The **public site** and **admin panel** share the same React app and build, split purely by route — there is no separate admin frontend deployment.

---

## 4. Data & AI Flow Summary

| Concern | Where it lives |
|---|---|
| Catalog data (bikes, stock, prices) | Postgres `bikes` table |
| Rider inquiries | Postgres `leads` table |
| Recommender activity (for demand analytics) | Postgres `recommendation_requests` table |
| Chatbot knowledge base (chunks + embeddings) | Postgres `rag_chunks` table |
| Embeddings + chat generation | Google Gemini API (stateless, called per-request) |
| Similarity search / ranking | Computed in the Node backend (no vector DB extension required) |
| Auth/session | JWT issued by the backend, stored client-side, no server-side session store |

---

## 5. Deployment Shape

- **Frontend**: static build via Vite, deployable to Vercel (`vercel.json` present in the repo).
- **Backend**: a standard Node/Express process, compatible with both always-on hosting and serverless/edge platforms — enabled by using Neon's serverless (WebSocket-based) Postgres driver instead of a traditional persistent connection pool.
- **Database**: Neon (managed, serverless Postgres) — no local database dependency.
- **AI provider**: Google Gemini, accessed over HTTPS with an API key — no self-hosted model.
