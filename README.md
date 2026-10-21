<div align="center">

# 🛠️ MaintainIQ

### AI-Powered QR Maintenance & Asset History Platform

**Track A — Advanced Full-Stack + GenAI Submission**
SMIT Final Hackathon

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel)](https://smit-final-hackathon-gamma.vercel.app/login)
[![Backend](https://img.shields.io/badge/Backend-API-blue?style=for-the-badge&logo=render)](https://smit-final-hackathon-backend-nu.vercel.app/)
[![CI/CD Pipeline](https://github.com/AhmedDevx07/SMIT-Final-Hackathon/actions/workflows/ci.yml/badge.svg)](https://github.com/AhmedDevx07/SMIT-Final-Hackathon/actions)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](#-docker-quickstart)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](#license)

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)](#)
[![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)](#)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](#)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](#)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](#)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](#)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=github-actions&logoColor=white)](#)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=flat-square&logo=redux&logoColor=white)](#)
[![Gemini API](https://img.shields.io/badge/Gemini_API-4285F4?style=flat-square&logo=googlegemini&logoColor=white)](#)

</div>

---

## 📖 Overview

**Maintainiq** is a full-stack, AI-assisted asset maintenance system built around **QR codes**. Every physical asset (machine, appliance, equipment) gets a unique QR code — scanning it opens a public page where anyone can report an issue in plain language. A **Google Gemini-powered triage engine** instantly classifies the complaint (title, category, priority, likely causes, safety checks), and the issue flows through a **strict, backend-enforced state machine**: `Reported → Under Inspection → Under Maintenance → Operational`, with a complete, auditable history preserved per asset.

Built end-to-end — auth, role-based access, AI integration, and a production deployment — within an **8-hour hackathon window**.

**🔗 Live App:** [smit-final-hackathon-gamma.vercel.app](https://smit-final-hackathon-gamma.vercel.app/login)
**🔗 Backend API:** [smit-final-hackathon-backend-nu.vercel.app](https://smit-final-hackathon-backend-nu.vercel.app/)
**🔗 Repository:** [github.com/AhmedDevx07/SMIT-Final-Hackathon](https://github.com/AhmedDevx07/SMIT-Final-Hackathon)

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔳 **QR-Based Asset Tracking** | Every asset gets an auto-generated unique code + QR image on creation |
| 🌐 **Public Reporting, No Login** | Anyone who scans a QR can view safe asset info and report an issue |
| 🤖 **AI Issue Triage** | Gemini API suggests title, category, priority, probable causes & safe checks from a free-text complaint |
| ✅ **Human-in-the-loop** | Users review and edit the AI's suggestion before it's ever submitted |
| 🔁 **Enforced State Machine** | Issue status can only move through valid, predefined transitions |
| 🧑‍🔧 **Role-Based Dashboards** | Separate, permission-scoped views for Admin and Technician |
| 📜 **Full Asset History** | Every status change and maintenance action is logged and timeline-viewable |
| 🎨 **Modern & Responsive UI** | Premium Midnight Blue & Indigo aesthetic built with Tailwind CSS |
| 🔐 **Secured by the Backend** | Business rules are enforced in controllers/middleware, not just hidden in the UI |

---

## 🧰 Tech Stack

**Backend**
- Node.js & Express
- MongoDB with Mongoose
- JWT Authentication
- Google Gemini API (AI Issue Triage)
- `qrcode` (QR generation)

**Frontend**
- React (Vite)
- Tailwind CSS
- Redux Toolkit
- React Router
- Framer Motion (animations)
- Axios

---

## 🖥️ Core Workflow

```
1. Admin registers an asset
       → unique asset code + QR code auto-generated

2. Public user scans the QR / opens the link
       → lands on a safe public asset page (no login required)

3. User describes the complaint
       → AI Issue Triage (Gemini) suggests title, category, priority, causes & safe checks

4. User reviews / edits the AI suggestion
       → then submits the issue

5. Issue lands on the Admin dashboard
       → gets assigned to a technician

6. Technician works the issue
       → Inspection → Maintenance → adds a maintenance note (required) → Resolved

7. Asset status cascades automatically
       → Issue Reported → Under Inspection → Under Maintenance → Operational

8. Full history timeline
       → preserved and viewable per asset, end to end
```

---

## 🔐 Security & Business Rules

These rules are enforced **in the backend**, not just hidden away in the UI:

- ✅ JWT auth + role-based `authorize()` middleware on every admin/technician route
- ✅ Public routes (`/api/assets/public/:assetCode`, `/api/issues/public`) return only safe fields — no internal notes, costs, or user data ever leak
- ✅ Issue transitions follow a strict state machine (`VALID_ISSUE_TRANSITIONS` in `issueController.js`) — invalid jumps are rejected with a clear error
- ✅ An issue **cannot** be marked Resolved without an existing maintenance log
- ✅ Maintenance cost can't be negative; next service date can't precede the last service date
- ✅ Asset codes and QR mappings are **immutable** once created — editing name/location never breaks the QR link
- ✅ Gemini API key lives only in the backend `.env` — never exposed to the frontend
- ✅ AI Triage has a graceful fallback — a timeout, missing key, or parse failure never blocks the workflow

---

## 🗄️ Database Schema

![Database Schema](./backend/docs/database-schema.png)

Entity-relationship diagram covering `User`, `Asset`, `Issue`, `MaintenanceLog`, and `AssetHistory`, including all foreign-key relationships (e.g. `Issue.asset → Asset._id`, `MaintenanceLog.issue → Issue._id`).

---

## 📮 API Documentation (Postman)

A full Postman collection is included, covering every endpoint (Auth, Assets, Issues, Maintenance, AI Triage), with pre-configured environment variables and auto-chaining test scripts — logging in automatically sets the auth token, and creating an asset or issue automatically sets its ID for the next request.

**Import it:** [`backend/postman/MaintainIQ.postman_collection.json`](./backend/postman/MaintainIQ.postman_collection.json)

1. Open Postman → **Import** → select the file above
2. Set the `baseUrl` collection variable to the deployed backend URL (or `http://localhost:5000` for local dev)
3. Run **Auth → Login User** first — the token is captured automatically for all subsequent requests
4. Run **Assets → Create Asset**, then **Issues → Report Issue (Public)** — their IDs chain automatically into the rest of the collection

---

## 🚀 Getting Started

### 🐳 Option A: Run with Docker Compose (Recommended)

Run the entire full-stack application (Frontend, Backend, and MongoDB) with a single command:

```bash
# 1. Clone repository
git clone https://github.com/AhmedDevx07/SMIT-Final-Hackathon.git
cd SMIT-Final-Hackathon

# 2. Copy environment template and configure (e.g., your Gemini API key)
cp .env.example .env

# 3. Start all services (Backend, Frontend, MongoDB)
docker compose up --build
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **MongoDB:** `localhost:27017`

To run the database seeder inside the Docker container:
```bash
docker compose exec backend npm run seed
```

To stop containers:
```bash
docker compose down
```

---

### 💻 Option B: Manual Local Setup

#### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local or Atlas)
- A Google Gemini API key

#### 1. Clone the repository
```bash
git clone https://github.com/AhmedDevx07/SMIT-Final-Hackathon.git
cd SMIT-Final-Hackathon
```

#### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env    # fill in MONGO_URI, JWT_SECRET, GEMINI_API_KEY
npm run seed             # creates demo admin/technician + 3 demo assets
npm run dev               # starts on http://localhost:5000
```

#### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev               # starts on http://localhost:5173
```

---

## 🔑 Demo Credentials

Try the [live app](https://smit-final-hackathon-gamma.vercel.app/login) instantly with these seeded accounts:

| Role | Email | Password |
|---|---|---|
| 👑 Admin | `admin@maintainiq.com` | `Admin123!` |
| 🔧 Technician | `Ali@maintainiq.com` | `tech123` |

---

## 📁 Folder Structure

```
├── .github/
│   └── workflows/ci.yml → GitHub Actions CI/CD pipeline
├── docker-compose.yml   → Full-stack orchestration (Frontend + Backend + MongoDB)
├── .env.example         → Root environment configuration template
│
backend/
├── Dockerfile           → Lightweight Node.js Alpine container
├── .dockerignore
├── .env.example         → Backend environment template
├── api/                 → Vercel serverless entry point
├── config/              → DB connection
├── controllers/          → Business logic per module
├── docs/                 → database-schema.png (ER diagram)
├── middleware/           → JWT auth, role guard, error handler
├── models/               → User, Asset, Issue, MaintenanceLog, AssetHistory
├── postman/              → MaintainIQ.postman_collection.json (full API collection)
├── routes/                → Express routers
├── utils/                 → Generators & history logger
├── seeder.js              → Demo data seeder
└── server.js              → Express entry point

frontend/
├── Dockerfile           → Multi-stage build (Vite build + Nginx Alpine)
├── nginx.conf           → Production Nginx config (SPA routing & gzip)
├── .dockerignore
├── .env.example         → Frontend environment template
└── src/
    ├── pages/           → Login, AdminDashboard, TechnicianDashboard, PublicAssetPage, AssetDetails
    ├── components/      → assets/, issues/, maintenance/, layout/
    ├── redux/           → auth, assets, issues slices
    ├── services/        → Axios client instance
    └── routes/          → PrivateRoute guard
```

---

## 🗺️ Roadmap & Continuous Improvements

- [x] 🐳 **Docker Containerization** (Multi-stage Dockerfiles + `docker-compose.yml`)
- [x] ⚙️ **GitHub Actions CI/CD** (Automated build, lint, syntax check & Docker build test)
- [ ] 🖼️ Evidence/image upload via Cloudinary
- [ ] ☁️ AWS S3 / ECS deployment option
- [ ] ⚡ Redis caching for frequent asset queries
- [ ] 📧 Email & SMS notifications for technician dispatch
- [ ] 🚦 API Rate limiting & DDoS protection

---

 
 ## 👨‍💻 Author

**Muhammad Ahmed (AhmedDevx07)**  
 
### 🌐 Connect With Me

* 🐙 GitHub: https://github.com/AhmedDevx07  
* 💼 LinkedIn: https://linkedin.com/in/ahmeddevx07  
* 🌐 Portfolio: https://ahmeddevx07.vercel.app/

---

## 📄 License

This project was built for the **SMIT Final Hackathon** (Track A: Advanced Full-Stack + GenAI).

<div align="center">

⭐ **If you found this project interesting, consider giving it a star!** ⭐

</div>
