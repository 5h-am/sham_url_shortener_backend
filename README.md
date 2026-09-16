# 🔗 URL Shortener — Backend API & Worker Engine

[![Live API](https://img.shields.io/badge/Render-Live_API-46E3B7?logo=render&logoColor=white)](https://sham-url-shortener-backend.onrender.com)
[![Frontend Client](https://img.shields.io/badge/Vercel-Live_Client-black?logo=vercel&logoColor=white)](https://sham-url-shortener.vercel.app/)

> 🚀 **Live Backend API**: [https://sham-url-shortener-backend.onrender.com](https://sham-url-shortener-backend.onrender.com)  
> 📑 **Live API Documentation (Swagger)**: [https://sham-url-shortener-backend.onrender.com/api-docs](https://sham-url-shortener-backend.onrender.com/api-docs)  
> 📊 **Live Bull-Board Dashboard**: [https://sham-url-shortener-backend.onrender.com/api/v1/admin/queues](https://sham-url-shortener-backend.onrender.com/api/v1/admin/queues)  
> 🌐 **Connected Frontend Client**: [https://sham-url-shortener.vercel.app/](https://sham-url-shortener.vercel.app/)

A high-performance, production-ready URL Shortener backend built with **Node.js**, **Express 5**, **TypeScript**, **PostgreSQL**, **Redis**, and **BullMQ**. It features high-throughput asynchronous click analytics, Base62 link encoding, multi-tier caching, automated link expiration, robust JWT authentication with silent refresh rotation, and a real-time BullMQ dashboard.

---

## 📑 Table of Contents

- [Features](#-features)
- [Architecture & Design Highlights](#-architecture--design-highlights)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Prerequisites](#-prerequisites)
- [Environment Variables](#-environment-variables)
- [Installation & Getting Started](#-installation--getting-started)
- [Database & Migrations](#-database--migrations)
- [API Documentation & Route Reference](#-api-documentation--route-reference)
  - [Public Redirection](#1-public-redirection)
  - [Authentication Routes](#2-authentication-routes-apiv1auth)
  - [URL Shortener Routes](#3-url-shortener-routes-apiv1)
  - [Analytics Routes](#4-analytics-routes-apiv1analysis)
  - [Admin & Queue Management](#5-admin--queue-management-apiv1admin)
  - [API Docs & Healthcheck](#6-api-docs--healthcheck)
- [Background Workers & Queues](#-background-workers--queues)
- [Rate Limiting & Security](#-rate-limiting--security)
- [Testing](#-testing)
- [Scripts Reference](#-scripts-reference)

---

## ✨ Features

- **Blazing Fast Redirections**: Caches hot redirect links in Redis for sub-millisecond lookups.
- **Asynchronous Click Analytics**: Non-blocking click tracking via BullMQ workers that ingest IP address, geographic location (country), User-Agent (browser, OS, device type), and referrer in the background.
- **Base62 Encoding**: Collision-free, compact URL codes generated from an atomic Redis sequence counter (`INCR urlCount`).
- **Secure Dual-Token Auth**: Short-lived Access Token (JWT) + Long-lived HTTP-only signed Refresh Cookie backed by Redis session storage.
- **Scheduled Expiration**: Delayed BullMQ jobs to automatically invalidate/delete links at a specified future date (`expiresAt`).
- **Interactive Queue Dashboard**: Admin-protected Bull-Board UI for monitoring BullMQ queue health, active jobs, retries, and failed jobs.
- **Built-in Swagger Documentation**: Interactive OpenAPI documentation available at `/api-docs`.
- **Structured Logging**: Production logging powered by Pino with automatic daily log rolling and Morgan request logs.

---

## 🏛️ Architecture & Design Highlights

```
                          ┌─────────────────────────────┐
                          │         Client / User       │
                          └──────────────┬──────────────┘
                                         │
                         HTTP GET /:code │ (Redirection)
                                         ▼
                             ┌───────────────────────┐
                             │     Express Server    │
                             └───────┬───────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 │ Cache Hit                             │ Cache Miss
                 ▼                                       ▼
        ┌─────────────────┐                     ┌─────────────────┐
        │   Redis Cache   │                     │ PostgreSQL (DB) │
        └────────┬────────┘                     └────────┬────────┘
                 │                                       │
                 └───────────────────┬───────────────────┘
                                     │ 302 Redirect
                                     ▼
        ┌────────────────────────────────────────────────────────┐
        │   BullMQ Queue: `urlAnalysis`                          │
        │   - Dispatches async job with IP, UA, Referrer, Time  │
        └────────────────────────────┬───────────────────────────┘
                                     │
                                     ▼
                     ┌───────────────────────────────┐
                     │ BullMQ Background Worker      │
                     │ - UA-Parser: Browser/OS/Device│
                     │ - IP Geolocation: Country     │
                     │ - Batch insert into PostgreSQL│
                     └───────────────────────────────┘
```

---

## 🛠️ Tech Stack

- **Runtime & Language**: Node.js (ES Modules), TypeScript
- **Framework**: Express.js v5
- **Primary Database**: PostgreSQL 17 (via `pg` Connection Pool)
- **Cache & Memory Store**: Redis 7 (via `ioredis` & `redis`)
- **Queue / Background Jobs**: BullMQ & `@bull-board` (Express Adapter)
- **Migrations**: `dbmate`
- **Validation**: Zod
- **Authentication**: JWT (`jsonwebtoken`), Argon2 password hashing, Signed Cookies (`cookie-parser`)
- **Security**: Helmet, CORS, Express-Rate-Limit
- **Logging & Monitoring**: Pino, Pino-Http, Pino-Roll, Morgan
- **Testing**: Vitest, Supertest, Docker Compose

---

## 📁 Project Directory Structure

```
backend/
├── compose.yaml                  # Docker Compose for PostgreSQL, Redis, Dbmate
├── compose.test.yaml             # Docker Compose for testing environment
├── db/
│   └── migrations/               # Dbmate SQL migrations
│       ├── 20260823172609_tables.sql
│       └── 20260823172634_triggers_and_index.sql
├── logs/                         # Rolling log files output
├── src/
│   ├── admin/                    # Bull-board queue monitor & routes
│   │   ├── queue.dashboard.routes.ts
│   │   └── queue.dashboard.ts
│   ├── analysis/                 # Analytics handlers, services, and queries
│   │   ├── analysis.handlers.ts
│   │   ├── analysis.repositories.ts
│   │   ├── analysis.routes.ts
│   │   ├── analysis.schema.ts
│   │   └── analysis.services.ts
│   ├── auth/                     # Authentication & password management
│   │   ├── auth.handlers.ts
│   │   ├── auth.repositories.ts
│   │   ├── auth.routes.ts
│   │   ├── auth.schema.ts
│   │   └── auth.services.ts
│   ├── config/                   # Configuration & service initializers
│   │   ├── db.ts                 # PostgreSQL connection pool
│   │   ├── email.ts              # Nodemailer transporter
│   │   ├── env.ts                # Zod environment variable validation
│   │   ├── globalErrorHandler.ts # Centralized Express error handler
│   │   ├── logger.ts             # Pino logger config & rolling streams
│   │   ├── queue.ts              # BullMQ queue instances
│   │   ├── rateLimiter.ts        # Rate limiter configurations
│   │   ├── redis.ts              # Redis client connection
│   │   └── swagger.ts            # Swagger / OpenAPI specification
│   ├── handlingLinks/            # Public URL redirector & analytics worker
│   │   ├── handlingLinks.cache.ts
│   │   ├── handlingLinks.handler.ts
│   │   ├── handlingLinks.repositories.ts
│   │   ├── handlingLinks.routes.ts
│   │   └── handlingLinks.worker.ts
│   ├── middlewares/              # Express middlewares (auth, admin, zod validator)
│   │   ├── admin.auth.middleware.ts
│   │   ├── auth.middleware.ts
│   │   └── validation.middleware.ts
│   ├── types/                    # Express ambient declarations
│   ├── urlShortener/             # Short URL generation & link management
│   │   ├── urlShortener.handler.ts
│   │   ├── urlShortener.repositories.ts
│   │   ├── urlShortener.routes.ts
│   │   ├── urlShortener.schema.ts
│   │   ├── urlShortener.services.ts
│   │   └── urlShortener.worker.ts
│   ├── utils/                    # AppError, Base62 encoders, helper utilities
│   ├── app.ts                    # Express application configuration
│   ├── server.ts                 # HTTP server bootstrap & graceful shutdown
│   └── users.routes.ts           # Top-level API router (`/api/v1`)
├── .env                          # Development environment variables
├── .env.test                     # Testing environment variables
├── eslint.config.ts              # ESLint configuration
├── package.json
├── tsconfig.json
└── vitest.config.js
```

---

## 📦 Prerequisites

Ensure you have the following installed on your system:
- **Node.js** (v20.x or later recommended)
- **npm** (v10.x or later)
- **Docker** & **Docker Compose** (for PostgreSQL and Redis)

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend` directory (or use `.env.test` for test runs). All variables are strictly validated on startup using **Zod**:

| Variable | Type | Description | Example |
|---|---|---|---|
| `PORT` | Number | Port on which the Express server listens | `3000` |
| `NODE_ENV` | String | Environment mode (`development` \| `testing` \| `production`) | `development` |
| `COOKIES_SIGN` | String | Secret key used to sign HTTP-only cookies | `your-cookie-signing-secret` |
| `ACCESS_TOKEN_SECRET` | String | JWT secret key for signing short-lived access tokens | `your-access-jwt-secret` |
| `REFRESH_TOKEN_SECRET` | String | JWT secret key for signing refresh tokens | `your-refresh-jwt-secret` |
| `RESET_PASSWORD_TOKEN_SECRET` | String | JWT secret key for password reset links | `your-reset-jwt-secret` |
| `BACKEND_URL` | URL | Full public URL of this backend service | `http://localhost:3000` |
| `FRONTEND_URL` | URL | Allowed CORS origin for the frontend client | `http://localhost:5173` |
| `POSTGRES_USER` | String | PostgreSQL database username | `postgres` |
| `POSTGRES_PASSWORD` | String | PostgreSQL database password | `postgres` |
| `POSTGRES_DB` | String | PostgreSQL database name | `url_shortener_db` |
| `POSTGRES_PORT` | Number | Host-mapped port for PostgreSQL | `5432` |
| `DATABASE_URL` | URL | Full PostgreSQL connection string | `postgres://user:pass@localhost:5432/url_shortener_db?sslmode=disable` |
| `REDIS_PORT` | Number | Host-mapped port for Redis | `6379` |
| `REDIS_URL` | URL | Full Redis connection string | `redis://localhost:6379` |
| `SMTP_USER` | Email | SMTP email address for sending reset emails | `user@example.com` |
| `SMTP_PWD` | String | SMTP application-specific password | `app-password` |
| `SMTP_HOST` | String | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | Number | SMTP server port | `465` |
| `SMTP_SERVICE` | String | SMTP service provider | `gmail` |

---

## 🚀 Installation & Getting Started

### 1. Clone the repository and navigate to backend
```bash
cd backend
npm install
```

### 2. Start PostgreSQL and Redis containers
```bash
docker compose up -d
```

### 3. Run Database Migrations
Apply all schema tables and triggers:
```bash
npm run db:up
```

### 4. Start the Development Server
```bash
npm run dev
```
The server will boot on `http://localhost:3000`. You should see:
```
Server booting on the 3000
Connection Established
URL shortener worker started
worker ready
Analysis worker ready
```

---

## 🗄️ Database & Migrations

Database migrations are managed via [dbmate](https://github.com/amacneil/dbmate) inside Docker.

### Migration Commands:
- **Apply pending migrations**:
  ```bash
  npm run db:up
  ```
- **Roll back the last migration**:
  ```bash
  npm run db:rollback
  ```
- **Check migration status**:
  ```bash
  npm run db:status
  ```
- **Create a new migration file**:
  ```bash
  docker compose run --rm dbmate new <migration_name>
  ```
- **Dump schema**:
  ```bash
  npm run db:dump
  ```

### Database Schema Overview:
- **`users`**: `id` (UUID), `email` (UNIQUE), `full_name`, `password_hash`, `user_role` (`user` | `admin`), `created_at`, `updated_at`.
- **`urls`**: `id` (UUID), `urls_code` (VARCHAR(10) UNIQUE), `users_id` (FK to `users.id`, nullable for public links), `original_url`, `created_at`.
- **`clicks`**: `id` (UUID), `urls_id` (FK to `urls.id`), `clicked_at`, `ip_address`, `country`, `referrer`, `browser`, `device`, `os`, `is_active`, `created_at`.

---

## 📡 API Documentation & Route Reference

### Base URLs:
- **Production Base Path**: `https://sham-url-shortener-backend.onrender.com/api/v1`
- **Production Short URL Redirection**: `https://sham-url-shortener-backend.onrender.com/:urlCode`
- **Local Development Base Path**: `http://localhost:3000/api/v1`
- **Local Short URL Redirection**: `http://localhost:3000/:urlCode`

---

### 1. Public Redirection

#### `GET /:urlCode`
Redirects the client to the original long URL with an HTTP `302 Found`.
- **Rate Limit**: 100 requests / min.
- **Workflow**:
  1. Checks Redis cache for `urls_code`.
  2. If cache miss, queries PostgreSQL and caches the result.
  3. Pushes an asynchronous job to `urlAnalysisQueue` containing request IP, User-Agent, and Referrer.
  4. Redirects immediately to target URL.

---

### 2. Authentication Routes (`/api/v1/auth`)

Rate limited by default to 5 requests / min on auth endpoints.

#### `POST /api/v1/auth/signUp`
Register a new user account.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123",
    "fullName": "Jane Doe"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "message": "Account Created Successfully",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
  ```
- **Note**: Also sets a signed HTTP-only `refreshToken` cookie scoped to `/api/v1/auth/`.

#### `POST /api/v1/auth/logIn`
Authenticate an existing user.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "message": "Login Successful",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
  ```
- **Note**: Sets signed HTTP-only `refreshToken` cookie.

#### `GET /api/v1/auth/refresh`
Rotate tokens using the signed `refreshToken` cookie.
- **Headers / Cookies**: Must include valid `refreshToken` signed cookie.
- **Response** (`200 OK`):
  ```json
  {
    "message": "Token Refreshed Successfully",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
  ```

#### `POST /api/v1/auth/forgetPwd`
Trigger a password reset email containing a time-limited reset token.
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "message": "Password details send to your email"
  }
  ```

#### `POST /api/v1/auth/resetPwd`
Reset password using the received token.
- **Request Body**:
  ```json
  {
    "token": "eyJhbGciOi...",
    "newPassword": "BrandNewPassword123"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "message": "Password Reset Successfully"
  }
  ```

#### `GET /api/v1/auth/logout`
Log out user, invalidate Redis refresh session, and clear cookies.
- **Authentication**: Required (`Authorization: Bearer <accessToken>`).
- **Response** (`200 OK`):
  ```json
  {
    "message": "Logged Out Successfully"
  }
  ```

---

### 3. URL Shortener Routes (`/api/v1`)

#### `POST /api/v1/unprotected/urlShortener`
Public endpoint to shorten a URL without logging in.
- **Rate Limit**: 100 requests / min per IP.
- **Request Body**:
  ```json
  {
    "originalUrl": "https://en.wikipedia.org/wiki/URL_shortening"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "message": "Url Shortened Successfully",
    "url": "http://localhost:3000/1aB"
  }
  ```

#### `POST /api/v1/protected/urlShortener`
Authenticated endpoint to shorten a link linked to user account, with optional scheduled expiration.
- **Authentication**: Required (`Authorization: Bearer <accessToken>`).
- **Query Parameters**:
  - `expiresAt` (optional): ISO 8601 future date string (e.g. `?expiresAt=2026-12-31T23:59:59Z`).
- **Request Body**:
  ```json
  {
    "originalUrl": "https://github.com/topics/react"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "message": "Url Shortened Successfully",
    "url": "http://localhost:3000/1aC"
  }
  ```

#### `GET /api/v1/fetchUrls`
Fetch all shortened URLs created by the authenticated user with total click counts.
- **Authentication**: Required (`Authorization: Bearer <accessToken>`).
- **Query Parameters**:
  - `urlsByDate`: `"all"` (default) \| `"day"` \| `"week"` \| `"month"`
  - `sortBy`: `"created_at"` (default) \| `"totalClicks"`
- **Response** (`200 OK`):
  ```json
  {
    "message": "Urls Fetched Successfully",
    "urls": [
      {
        "id": "c71a3994-e349-4fb5-9014-ce9fbdf18903",
        "urls_code": "1aC",
        "original_url": "https://github.com/topics/react",
        "created_at": "2026-09-16T18:12:00.000Z",
        "totalclicks": "42"
      }
    ]
  }
  ```

#### `GET /api/v1/urlDelete/:urlId`
Delete a URL owned by the authenticated user.
- **Authentication**: Required (`Authorization: Bearer <accessToken>`).
- **Parameters**: `urlId` (UUID of the link).
- **Response** (`200 OK`):
  ```json
  {
    "message": "Url Deleted Successfully"
  }
  ```

---

### 4. Analytics Routes (`/api/v1/analysis`)

All analytics endpoints require authentication (`Authorization: Bearer <accessToken>`).

#### `GET /api/v1/analysis/topValues/:urlsId`
Fetches top distributions for referrers, locations (countries), devices, and browsers.
- **Parameters**: `urlsId` (UUID of the link).
- **Response** (`200 OK`):
  ```json
  {
    "message": "Top Values Fetched Successfully",
    "topBrowsers": [{ "browser": "Chrome", "count": "32" }],
    "topCountries": [{ "country": "India", "count": "25" }],
    "topReferrers": [{ "referrer": "https://t.co/", "count": "14" }],
    "topDevices": [{ "device": "mobile", "count": "28" }]
  }
  ```

#### `GET /api/v1/analysis/clicksOverTime`
Fetches time-series aggregated click metrics for charting.
- **Query Parameters**:
  - `urlsId` (UUID): ID of the URL.
  - `groupBy`: `"hour"` \| `"day"` \| `"week"` \| `"month"` \| `"year"`.
- **Response** (`200 OK`):
  ```json
  {
    "message": "Clicks fetched successfully",
    "clicksOverTime": [
      {
        "grouped_by": "2026-09-16 18:00:00",
        "click_count": "15"
      }
    ]
  }
  ```

---

### 5. Admin & Queue Management (`/api/v1/admin`)

#### `USE /api/v1/admin/queues`
Interactive Bull-Board web dashboard for inspecting BullMQ queues.
- **Authentication**: Requires valid `accessToken` with `user_role === 'admin'`.
- **Monitored Queues**:
  - `urlShortener`: URL creation tasks
  - `urlAnalysis`: Click tracking and UA/IP analysis
  - `expiredUrls`: Delayed expiration deletion jobs

---

### 6. API Docs & Healthcheck

- **Swagger UI**: Visit `http://localhost:3000/api-docs`
- **Health Check**: `GET http://localhost:3000/api/v1/` returns `{"message": "hello brother"}`

---

## ⚡ Background Workers & Queues

BullMQ processes tasks asynchronously with automated retry backoffs:

1. **`urlShortener` Queue**:
   - `insert-url-database-protected` (concurrency: 9, priority: 5, retries: 5 with exponential backoff).
   - `insert-url-database-unprotected` (concurrency: 9, priority: 4).
2. **`urlAnalysis` Queue**:
   - `url-click-analysis` (concurrency: 5, priority: 3, retries: 5). Parses User-Agent via `ua-parser-js`, calls IP country lookup, and persists to the `clicks` table.
3. **`expiredUrls` Queue**:
   - `delete-url-on-expire-date` (concurrency: 2). Delayed job scheduled for `expiresAt - Date.now()`.

---

## 🛡️ Rate Limiting & Security

- **Authentication Limiter**: Max 5 attempts per minute (`authLimiter`).
- **Shortener Limiter**: Max 100 requests per minute per IP (`urlShortenerLimiter`).
- **Redirect Limiter**: Max 100 redirects per minute per IP (`redirectUrlLimiter`).
- **Per-User Rate Limiter**: 100 requests per minute tracked in Redis (`rateLimiter:<refreshId>`).
- **Helmet**: Secures HTTP headers.
- **CORS**: Enforces `FRONTEND_URL` with credentials support.
- **Payload Sanitization**: Request bodies restricted to 10KB.

---

## 🧪 Testing

The backend includes automated integration and unit test setups using **Vitest**:

```bash
# Start test containers (isolated PostgreSQL and Redis)
npm run test:infra:up

# Run test database migrations
npm run test:migrate

# Run tests
npm run test:run

# Run full integration cycle (spins up infra, migrates, runs tests)
npm run test:integration

# Teardown test containers
npm run test:infra:down
```

---

## 📜 Scripts Reference

| Command | Action |
|---|---|
| `npm run dev` | Runs backend in watch mode with `tsx` |
| `npm run build` | Compiles TypeScript to `dist/` |
| `npm start` | Runs compiled production build from `dist/server.js` |
| `npm run db:up` | Runs all pending database migrations |
| `npm run db:down` | Rolls back the latest database migration |
| `npm run db:status` | Shows current migration status |
| `npm run lint` | Runs ESLint check |
| `npm run lint:fix` | Fixes ESLint formatting and linting errors |
| `npm test` | Runs tests in watch mode |
| `npm run test:coverage` | Generates Vitest code coverage report |
