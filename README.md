# 🚗 Rental SaaS — Frontend Web App

A multi-tenant car rental SaaS management dashboard built with **Angular 21** (standalone, zoneless signals). Features full RBAC, fleet management, reservations, rentals, and finance/invoicing.

---

## 📋 Requirements

| Dependency | Version |
|---|---|
| Node.js | `^20.x` or `^22.x` (LTS recommended) |
| npm | `^10.x` |
| Angular CLI | `^21.x` |

> **Backend API must be running** at `http://127.0.0.1:8000` before starting the frontend. See [`rental-saas-api/README.md`](../rental-saas-api/README.md).

---

## ⚙️ Tech Stack

- **Framework:** Angular 21 (Standalone Components, Signals, Zoneless)
- **Language:** TypeScript 5.9
- **Styling:** Vanilla CSS (custom design system with CSS variables)
- **Charts:** Chart.js 4
- **HTTP:** Angular `HttpClient` with JWT interceptor
- **Auth:** JWT token stored in `localStorage`

---

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd rental-saas-web
```

### 2. Install dependencies

```bash
npm install
```

### 3. Verify API URL

The app is pre-configured to talk to the backend at:

```
http://127.0.0.1:8000/api/v1
```

This is set directly in each service file under:
```
src/app/core/services/
```

If your backend runs on a different port or host, update `apiUrl` in each service accordingly.

### 4. Start the development server

```bash
npm start
```

or equivalently:

```bash
npx ng serve
```

The app will be available at: **`http://localhost:4200`**

The dev server supports **Hot Module Replacement (HMR)** — changes reload automatically.

---

## 🔑 Login Credentials

Use these credentials on the login page at `http://localhost:4200/login`:

### Super Admin _(full access to all modules)_

| Field    | Value                   |
|----------|-------------------------|
| Email    | `admin@acmerental.com`  |
| Password | `password`              |
| Role     | Super Admin             |

### Agent _(limited access)_

| Field    | Value                   |
|----------|-------------------------|
| Email    | `agent@acmerental.com`  |
| Password | `password`              |
| Role     | Agent                   |

> **Agent** can access: Customers, Assets (view only), Reservations, Rentals. Cannot access Finance or User Management.

---

## 📁 Project Structure

```
rental-saas-web/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── services/        # API services (auth, customers, assets, etc.)
│   │   │   ├── guards/          # Auth route guards
│   │   │   └── interceptors/    # JWT token interceptor
│   │   ├── features/
│   │   │   ├── auth/            # Login page
│   │   │   ├── dashboard/       # Main dashboard with charts
│   │   │   ├── customers/       # Customer management
│   │   │   ├── assets/          # Fleet asset management
│   │   │   ├── reservations/    # Reservation management
│   │   │   ├── rentals/         # Active rental management
│   │   │   ├── finance/         # Invoices & finance
│   │   │   └── users/           # User & role management
│   │   └── shared/
│   │       ├── components/      # Layout (header, sidebar, app-layout)
│   │       └── directives/      # *hasPermission directive
│   ├── styles.css               # Global design system (CSS variables, tokens)
│   └── main.ts                  # App bootstrap (zoneless)
├── package.json
└── angular.json
```

---

## 🧩 Available Features

| Module | Route | Description |
|--------|-------|-------------|
| Dashboard | `/dashboard` | Analytics overview with charts |
| Customers | `/customers` | Full CRUD — Individual & Business |
| Fleet (Assets) | `/assets` | Vehicle/asset management |
| Reservations | `/reservations` | Booking management |
| Rentals | `/rentals` | Active rental check-in/out |
| Finance | `/finance/invoices` | Invoice listing & details |
| Users | `/users` | Staff & role management |

---

## 🛠️ Useful Commands

```bash
# Start dev server
npm start

# Build for production
npm run build

# Run tests
npm test

# Lint / format with Prettier
npx prettier --write "src/**/*.{ts,html,css}"
```

---

## 🔗 Backend Dependency

This frontend **requires** the `rental-saas-api` Laravel backend to be running.

Start the backend first:
```bash
# From the rental-saas-api directory
php artisan serve --host=127.0.0.1 --port=8000

# Or using XAMPP PHP
D:\xampp\php\php.exe artisan serve --host=127.0.0.1 --port=8000
```

Then start the frontend:
```bash
# From rental-saas-web directory
npm start
```

---

## 🌐 Ports Summary

| Service | URL |
|---------|-----|
| Frontend (Angular) | `http://localhost:4200` |
| Backend API (Laravel) | `http://127.0.0.1:8000/api/v1` |
| Database (MySQL/XAMPP) | `127.0.0.1:3306` |
