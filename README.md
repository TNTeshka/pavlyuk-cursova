# Task‑Manager Monorepo

## 📖 Overview

This repository contains a small **full‑stack task manager** built with:
- **Backend** – Express, Prisma ORM, JWT authentication (`apps/api`).
- **Frontend** – React + Vite, using a header‑only navigation (`apps/web`).

The UI now shows an **Admin** link (visible only to the admin user) that lists all registered users.

---

## 🛠 Prerequisites

- **Node.js** ≥ 20 (recommended) – https://nodejs.org/
- **npm** (comes with Node) or **pnpm**/Yarn if you prefer.
- **PostgreSQL** (or any DB supported by Prisma). The example uses `postgresql://postgres:postgres@localhost:5433/task_manager?schema=public`.
- **Git** – the project is a Git repository.

---

## 📦 Install dependencies

```bash
# From the repository root
npm install                # installs any root‑level tooling (optional)

# Backend (API)
cd apps/api
npm install                # Express, Prisma, etc.

# Frontend (Web)
cd ../../apps/web
npm install                # React, Vite, Tailwind, …
```

---

## 🗄️ Prisma – generate client & run migrations

```bash
# Still in apps/api
npx prisma generate        # creates the TS client from schema.prisma
npx prisma migrate dev     # applies the development migration (creates tables)
```

---

## 🔐 Admin credentials

The **admin user** is created by the seed script (`apps/api/src/seed.ts`). It reads the following environment variables:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_USERNAME`

These variables **must be present** in the **backend env file** (`apps/api/.env`). A sample file is already committed:

```dotenv
# apps/api/.env (example – keep it secret!)
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/task_manager?schema=public"
JWT_SECRET="your_long_random_secret_here"
PORT=4000
CORS_ORIGIN="http://localhost:5173"

# ---- Admin credentials (keep these secret!) ----
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=qwe123456   # ← replace with a strong password you choose
ADMIN_USERNAME=admin
```

> **Do not commit this file** – it is ignored by `.gitignore`.
>
> If you prefer to keep secrets out of the repository, create the file locally by copying the example:
>
> ```bash
> cp apps/api/.env.example apps/api/.env   # if an example exists
> # edit the ADMIN_* values to your real credentials
> ```
>
> The seed script (`npm run seed`) will create the admin record **only if it does not already exist**.

---

## 🚀 Running the application (development)

### API server
```bash
cd apps/api
npm run dev                # starts the Express server on $PORT (default 4000)
```

### Front‑end (Vite)
Open a **second** terminal:
```bash
cd ../../apps/web
npm run dev                # Vite dev server → http://localhost:5173
```

The frontend proxies API calls to `http://localhost:4000` (CORS is pre‑configured).

---

## 🌱 Seed the admin user (once)

```bash
cd apps/api
npm run seed               # creates admin if missing
```

If you later change `ADMIN_PASSWORD`, run the seed script again – it will skip creation if the admin already exists. You can manually reset the password by updating the DB or adding a password‑reset endpoint.

---

## 📚 Quick cheat‑sheet (one‑liners)

```bash
# Install everything
npm install && cd apps/api && npm install && cd ../../apps/web && npm install

# Prisma setup
cd apps/api && npx prisma generate && npx prisma migrate dev

# Create .env (if missing) – edit ADMIN_* values
cp apps/api/.env.example apps/api/.env   # edit the file

# Seed admin
npm run seed

# Run dev servers (two terminals)
# API
cd apps/api && npm run dev
# Web
cd ../../apps/web && npm run dev
```

---

## 📦 Production / deployment notes

- **Environment variables** – set the same variables (`DATABASE_URL`, `JWT_SECRET`, `PORT`, `CORS_ORIGIN`, `ADMIN_*`) in your deployment platform (Docker, Railway, Render, Vercel, etc.).
- **Do not commit `.env`** – it is already ignored.
- **Ports** – API defaults to **4000**, Vite dev server defaults to **5173**. You can override them via `PORT` and `VITE_API_URL` (frontend) if needed.
- **Build the frontend** for production:
  ```bash
  cd apps/web
  npm run build            # creates a static site in ./dist
  ```
  Serve the `dist` folder with any static‑file host (nginx, Vercel, Netlify, …).

---

## ✅ What you should see

1. Open `http://localhost:5173`.
2. Log in with the admin credentials you set in `apps/api/.env`.
3. The header now contains an **Admin** navigation link.
4. Clicking **Admin** shows a table with **all users**.

That’s it! 🎉
