# Campus Walker — Hybrid AR Navigation System for Indoor/Outdoor Campus Wayfinding

Campus Walker is a full-stack campus navigation platform that combines:
- **Visitor onboarding and destination selection**
- **Role-based admin dashboards** (Super Admin, University Admin, Institute Admin)
- **Outdoor AR navigation** using device sensors + map data
- **Indoor navigation management** (building points + paths)
- **Analytics dashboards** for visitor movement and traffic

It is designed for multi-university/multi-institute deployments where each level can manage its own campus data while preserving centralized oversight.

---

## Table of Contents

1. [Key Features](#key-features)
2. [Tech Stack](#tech-stack)
3. [Architecture Overview](#architecture-overview)
4. [User Roles & Responsibilities](#user-roles--responsibilities)
5. [Project Structure](#project-structure)
6. [Screenshots](#screenshots)
7. [Getting Started (Local Development)](#getting-started-local-development)
8. [Environment Variables](#environment-variables)
9. [Run, Build, and Deploy](#run-build-and-deploy)
10. [API Modules (High-Level)](#api-modules-high-level)
11. [Operational Notes](#operational-notes)
12. [Troubleshooting](#troubleshooting)
13. [Future Improvements](#future-improvements)
14. [License](#license)

---

## Key Features

### Visitor Experience
- Public visitor form (`/`) to register/check in.
- Destination-based routing support.
- Real-time outdoor AR navigation view with directional arrows and compass cues.

### Outdoor Navigation
- Outdoor AR scene in `frontend/public/navigation.html`.
- Map-assisted coordinate selection and visibility toggle.
- Sensor-driven heading updates and navigation state indicators.

### Indoor Navigation
- Indoor AR page in `frontend/public/indoor.html`.
- Institute-level indoor location and path management.
- Building-specific path graph support for route rendering.

### Admin Dashboards
- **Super Admin**: manage universities, admins, system-wide visitors, and global stats.
- **University Admin**: manage institutes, university visitor data, and location sets.
- **Institute Admin**: manage locations, routes, and indoor navigation entities.

### Analytics
- Date-wise and entity-wise visitor charts.
- Tabular records with filtering and actions.

---

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router
- Chart.js / Recharts
- Leaflet / React-Leaflet
- A-Frame + aframe-ar

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT auth
- Multer + Cloudinary/local uploads
- CORS-enabled REST APIs

---

## Architecture Overview

```text
[Visitor/Admin Browser]
        |
        v
[React Frontend + Static AR HTML Pages]
        |
        v
[Express API Layer]
  |   |   |   |
  |   |   |   +--> Auth
  |   |   +------> Visitor + Navigation
  |   +----------> University/Institute/Admin Ops
  +--------------> Indoor Navigation Ops
        |
        v
[MongoDB]
```

### Main Runtime Paths
- Frontend app routes are controlled in `frontend/src/App.jsx`.
- Static AR pages are served from `frontend/public/navigation.html` and `frontend/public/indoor.html`.
- Backend API entrypoint is `backend/server.js`.

---

## User Roles & Responsibilities

### 1) Super Admin
- Create and manage universities.
- Create university/super admins.
- Monitor system-wide visitors and distributions.

### 2) University Admin
- Create and manage institutes under a university.
- Track university-level visitor analytics.
- Manage university scoped location data.

### 3) Institute Admin
- Add/edit/delete locations.
- Create route/path records between locations.
- Configure indoor navigation (locations + path graph).

### 4) Visitor
- Register via public form.
- Select source/destination.
- Launch AR navigation guidance.

---

## Project Structure

```text
campus-walker/
├── README.md
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── uploads/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       └── utils/
└── frontend/
    ├── package.json
    ├── public/
    │   ├── navigation.html
    │   ├── indoor.html
    │   └── assets/
    └── src/
        ├── App.jsx
        ├── pages/
        ├── components/admin/
        └── utils/
```

---

## Screenshots

You shared strong UI references; below is the recommended placement for a polished README gallery.

> **How to use this section:**
> 1. Create `docs/images/`.
> 2. Save your provided screenshots with the suggested names below.
> 3. Keep/replace the markdown links as needed.

### 1) Location Coordinate Picker (Map)
Great for showing route/location setup workflow.

![Location Selection Map](docs/images/location-selection-map.jpg)

### 2) Outdoor AR Navigation (Mobile View)
Best for demonstrating real-world guidance UI.

![Outdoor AR Navigation](docs/images/outdoor-ar-mobile.jpg)

### 3) Route Creation Form
Use this to explain route authoring for institute admins.

![Add New Route Form](docs/images/add-route-form.jpg)

### 4) Super Admin Analytics Dashboard
Highlights global visibility and analytics.

![Super Admin Dashboard](docs/images/super-admin-dashboard.jpg)

### 5) University Admin Dashboard
Shows university-level operational view.

![University Dashboard](docs/images/university-dashboard.jpg)

### 6) Add New Location Form
Useful for documenting location creation flow.

![Add New Location Form](docs/images/add-location-form.jpg)

---

## Getting Started (Local Development)

## 1) Prerequisites
- Node.js **18+**
- npm **9+**
- MongoDB **6+**
- Git

## 2) Clone

```bash
git clone <your-repo-url>
cd campus-walker
```

## 3) Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # if you maintain an example file
```

If there is no `.env.example`, create `.env` manually (see [Environment Variables](#environment-variables)).

Run backend:

```bash
npm run dev
```

Backend default target: `http://localhost:5000`

## 4) Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Run frontend:

```bash
npm run dev
```

Frontend default target: `http://localhost:5173`

---

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ar_nav_db
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRE=30d
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
BASE_URL=http://localhost:5000

# Optional Cloudinary (if enabled in your deployment)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

### Important Static AR URL Check
The static AR pages may contain explicit API URLs. Verify/update these to match deployment:
- `frontend/public/navigation.html`
- `frontend/public/indoor.html`

---

## Run, Build, and Deploy

### Development
Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

### Production Build (Frontend)
```bash
cd frontend
npm run build
npm run preview
```

### Production Run (Backend)
```bash
cd backend
npm start
```

### Deployment Checklist
- [ ] MongoDB connection is reachable from server runtime.
- [ ] `CORS_ORIGINS` includes your frontend domain.
- [ ] `VITE_API_URL` points to deployed backend `/api`.
- [ ] `navigation.html` and `indoor.html` API references are updated.
- [ ] Upload directories or cloud media storage are configured.

---

## API Modules (High-Level)

Based on route mounting in backend server:
- `/api/auth` — authentication
- `/api/super-admin` — super admin operations
- `/api/university` — university-level operations
- `/api/institute` — institute-level operations
- `/api/visitors` — visitor intake and management
- `/api/public/universities` — public university listing
- `/api/navigation` — outdoor navigation endpoints
- `/api/indoor` — indoor navigation endpoints

---

## Operational Notes

- Uploaded media is served via `/uploads` in backend runtime.
- Admin dashboard access is route-protected using role-based checks.
- For accurate AR navigation on mobile devices, ensure:
  - Location permissions are granted
  - Compass/motion access is enabled
  - HTTPS is used in production (recommended/required for sensor APIs on many devices)

---

## Troubleshooting

### Frontend cannot reach backend
- Verify backend is running on the expected port.
- Check `VITE_API_URL` value.
- Ensure backend CORS includes frontend origin.

### AR screen shows but no direction updates
- Confirm location + motion permissions on device.
- Test outdoors for stronger GPS signal.
- Verify destination coordinates are valid.

### Login works but dashboard data is empty
- Check seeded/created admin data by role.
- Inspect browser network panel for 401/403/500 responses.
- Validate JWT token presence and expiration.

---

## Future Improvements

- Add Docker Compose for one-command local startup.
- Add API schema docs (OpenAPI/Swagger).
- Add seed scripts for demo data.
- Add automated tests (backend unit/integration + frontend component tests).
- Add CI pipeline (lint, build, tests).

---

## License

Add your project license here (MIT/Apache-2.0/Proprietary).
