# StarShelf — Store Rating & Review Platform

StarShelf is a multi-role store rating and review web application built using JavaScript across the entire stack. Users can discover stores, submit 1-to-5 star ratings with optional written comments, inspect rating distributions, and manage their profiles. Store owners can track customer feedback via an interactive dashboard, and system administrators manage users, stores, categories, and site-wide analytics.

---

## Tech Stack

### Frontend (`/client`)
* **Framework:** React 19 (Vite, JavaScript with JSX)
* **Styling:** Tailwind CSS v3 with dynamic CSS variable design system
* **Routing & State:** React Router v7, TanStack Query v5, React Hook Form with Zod resolver
* **UI Components & Icons:** Recharts, Lucide React, react-hot-toast, `@fontsource-variable/manrope`
* **HTTP Client:** Axios with 429 Retry-After & error handling interceptors
* **Testing:** Vitest, React Testing Library, jsdom

### Backend (`/server`)
* **Runtime & Framework:** Node.js 20+, Express 5, JavaScript ES Modules (`"type": "module"`)
* **Database & ORM:** PostgreSQL 16 with Prisma ORM
* **Authentication:** HttpOnly JWT cookie with bcrypt password hashing
* **Validation:** Zod schemas applied strictly (`.strict()`) to bodies, queries, and params
* **Security & Hardening:** Helmet (CSP enabled), CORS, express-rate-limit, origin check, SQL injection protection
* **Documentation & Logging:** Swagger UI (`/api/docs`) via `@asteasolutions/zod-to-openapi`, Pino logger
* **Email:** Mailpit for local SMTP testing via Nodemailer
* **Testing:** Vitest and Supertest

---

## Key Features & User Roles

### 1. System Administrator (`ADMIN`)
* **Admin Dashboard:** Overview cards (total users, total stores, total ratings) and a 14-day rating submission area chart.
* **User Management:** Add users with roles (`ADMIN`, `USER`, `OWNER`), filter users by name, email, address, and role.
* **Store Management:** Add stores with assigned categories and optional owners. Filter by category, search by name/address.
* **Category Management:** Add dynamic store categories with unique slugs.
* **User Detail View:** View full user details, including store rating if the user is a store owner.

### 2. Normal User (`USER`)
* **Public Registration & Verification:** Register, log in, verify email, request password resets via email.
* **Store Discovery:** Search stores by name and address, filter by category.
* **Weighted Top-Rated Sort:** Bayesian weighted average rating sort so single 5-star ratings don't outrank established top stores.
* **Ratings & Written Reviews:** Submit or update 1-to-5 star ratings with optional written comments (up to 500 characters).
* **Review Drawer:** Browse paginated reviews and ratings submitted by other users for any store.

### 3. Store Owner (`OWNER`)
* **Store Dashboard:** View average rating, overall response count, and 1-to-5 star rating breakdown bars.
* **Raters Table:** Paginated table listing users who rated the store, including their star values, written comments, and timestamps.
* **Unassigned State:** Clear notice when a store owner account does not have an assigned store.

### 5. Philatelist "Postage Stamp" Visual Theme
* **Real 4-Edge Perforations:** Computed via CSS `mask-image` repeating 4px radial-gradients along top, bottom, left, and right edges using `destination-in` / `intersect` composition so true 8px scalloped notches allow album page background colors (`#E8E1F0` light, `#150F21` dark) to show through.
* **Circular Postmark Overlay:** Built as an inline SVG displaying neighbourhood text on a curved SVG `<path>` (`<textPath>`), dashed double rings, and 3-line wavy cancellation lines rendered at 70% opacity in secondary accent color.
* **Interactive Stamp Collecting:** Collecting a stamp triggers a 250ms "thunk" stamp animation (`animate-thunk`).
* **Typography:** `Abril Fatface` for store names and large stamp denomination numerals, and `Josefin Sans` for UI elements and small caps spaced neighbourhood labels.

---

## Seed Accounts (Development)

The database seed script generates standard test accounts (Password for all seed accounts is `Password@123` or as listed below):

| Role | Email | Password |
|---|---|---|
| **System Admin** | `admin@starshelf.com` | `AdminPass@123` |
| **Store Owner** | `owner@starshelf.com` | `OwnerPass@123` |
| **Normal User** | `user@starshelf.com` | `UserPass@123` |

---

## Environment Variables

### Server (`server/.env`)
| Variable | Description | Default / Example |
|---|---|---|
| `PORT` | HTTP Server Port | `4000` |
| `NODE_ENV` | Runtime Environment | `development` |
| `DATABASE_URL` | PostgreSQL Connection String | `postgresql://postgres:postgres@localhost:5432/starshelf?schema=public` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `super-secret-jwt-key` |
| `COOKIE_SECRET` | Secret key for signing cookies | `super-secret-cookie-key` |
| `CORS_ORIGIN` | Allowed Client Origin | `http://localhost:5173` |
| `SMTP_HOST` | Mail server hostname | `localhost` |
| `SMTP_PORT` | Mail server port | `1025` |
| `SMTP_SECURE` | Enable SSL/TLS for SMTP | `false` |
| `SMTP_FROM` | Sender address | `no-reply@starshelf.local` |
| `CLIENT_URL` | Frontend URL for email links | `http://localhost:5173` |

### Client (`client/.env`)
| Variable | Description | Default / Example |
|---|---|---|
| `VITE_API_BASE_URL` | Base API URL | `/api` |

---

## Running the Application

### Option A: Quick Start with Docker Compose

Ensure Docker and Docker Compose are installed, then run:

```bash
docker compose up --build
```

Access services at:
* **Frontend Web App:** `http://localhost`
* **Backend API Documentation:** `http://localhost/api/docs` (or `http://localhost:4000/api/docs`)
* **Mailpit Email Client:** `http://localhost:8025`

### Option B: Local Manual Setup (Without Docker)

#### 1. Prerequisites & Database
Ensure PostgreSQL is running locally and database `starshelf` exists. Start Mailpit (or run a local SMTP server on port 1025).

#### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env

# Run database migrations and seed initial data
npx prisma db push
node prisma/seed.js

# Start backend server in development mode
npm run dev
```
Backend runs at `http://localhost:4000`.

#### 3. Frontend Setup
```bash
cd ../client
npm install
cp .env.example .env

# Start frontend Vite development server
npm run dev
```
Frontend runs at `http://localhost:5173`.

---

## Testing & Quality Gates

### Backend Tests
```bash
cd server
npm test
```
Runs integration and unit test suites verifying validation, authentication, role access control, rating calculation, pagination, security headers, and rate limiting.

### Frontend Tests
```bash
cd client
npm test
```
Runs Vitest and React Testing Library tests for client validators and UI components.

### Code Quality / Linting
```bash
# In server directory
cd server && npm run lint

# In client directory
cd client && npm run lint
```
Both applications adhere strictly to zero ESLint errors or warnings.

---

## API Documentation

Interactive Swagger (OpenAPI 3.1) documentation is automatically served at `/api/docs`. You can explore request parameters, schemas, and try out endpoints directly from the browser.
