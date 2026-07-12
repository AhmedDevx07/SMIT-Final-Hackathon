# MaintainIQ - AI-Powered QR Maintenance & Asset History Platform

## Project Overview
MaintainIQ is an asset maintenance management platform that allows teams to track assets, report issues via QR codes, and leverage AI to triage and prioritize maintenance requests. The platform features role-based access control for Admins and Technicians, along with a public page for submitting issues.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB, Mongoose
- **AI:** Google Generative AI (Gemini API)
- **Other:** QR Code generation, JWT authentication

## Project Structure
```
Hackathon/
├── backend/
│   ├── controllers/
│   │   ├── assetController.js
│   │   ├── issueController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── Asset.js
│   │   ├── History.js
│   │   ├── Issue.js
│   │   ├── MaintenanceRecord.js
│   │   └── User.js
│   ├── routes/
│   │   ├── assetRoutes.js
│   │   ├── issueRoutes.js
│   │   └── userRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    ├── src/
    │   ├── App.jsx
    │   ├── api/
    │   ├── context/
    │   ├── pages/
    │   └── main.jsx
    ├── .env
    ├── package.json
    ├── vite.config.js
    └── index.html
```

## Setup Instructions
### 1. Backend Setup
1. Navigate to `backend/` directory
2. Install dependencies: `npm install`
3. Create a `.env` file in `backend/` with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/maintainiq
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Start the backend server: `npm run dev`

### 2. Frontend Setup
1. Navigate to `frontend/` directory
2. Install dependencies: `npm install`
3. Create a `.env` file in `frontend/` with:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the frontend dev server: `npm run dev`

## Demo Credentials
### Admin User
- Email: admin@maintainiq.com
- Password: Admin123!

### Technician User
- Email: tech@maintainiq.com
- Password: Tech123!

## Features
- Asset management with QR code generation
- AI-powered issue triage using Google Gemini API
- Role-based access control (Admin and Technician)
- Maintenance record tracking
- Asset history timeline
- Public asset page for issue reporting
- Category and location filters
- Copy public link and open public page functionality

## API Endpoints
### Users
- `POST /api/users/register`: Register a new user
- `POST /api/users/login`: User login
- `GET /api/users`: Get all users (Admin only)

### Assets
- `POST /api/assets`: Create a new asset (Admin only)
- `GET /api/assets`: Get all assets (Admin and Technician)
- `GET /api/assets/public/:assetCode`: Get public asset details (No auth)
- `PUT /api/assets/:id`: Update asset (Admin only)
- `DELETE /api/assets/:id`: Delete asset (Admin only)
- `GET /api/assets/:id/history`: Get asset history (Admin and Technician)
- `GET /api/assets/:id/maintenance-records`: Get asset maintenance records (Admin and Technician)

### Issues
- `POST /api/issues/create`: Create a new issue
- `POST /api/issues/triage`: Triage an issue using AI
- `GET /api/issues`: Get all issues (Admin and Technician)
- `GET /api/issues/stats`: Get issue statistics
- `PUT /api/issues/status/:id`: Update issue status
- `PUT /api/issues/assign/:id`: Assign issue to a technician
