# Student Syllabus Management System

Production-ready full-stack starter template for managing users, courses, syllabi, schedules, assignments, grades, notifications, and admin operations.

## Tech Stack

- **Frontend**: React (Vite), Material UI, React Router
- **Backend**: Node.js, Express, JWT auth, RBAC, security middleware
- **Database**: MongoDB + Mongoose with indexed schemas
- **DevOps**: Docker + docker-compose

## Monorepo Structure

```text
apps/
  api/     # Express REST API, auth, models, routes, tests
  web/     # React dashboard with role-based views
```

## Features Included

- User registration/login, JWT authentication, password reset flow
- Role-based access control (student/teacher/admin)
- Profile APIs
- Course management and batch/semester organization
- Syllabus management with PDF upload/download and version history
- Topic-level syllabus allocation, coverage tracking, completion analytics, and backlog alerts
- Academic calendar/events APIs
- Assignment creation and submission tracking
- Grade entry and GPA endpoint
- Notification center (in-app + email/SMS integration placeholders)
- Admin stats and audit log endpoints
- Security: Helmet, CORS, rate limiting, centralized error handling, input validation
- Responsive frontend dashboard, role switcher, dark/light theme support

## Local Setup

### 1) Install dependencies

```bash
npm install
npm install -w api
npm install -w web
```

### 2) Configure API env

```bash
cp apps/api/.env.example apps/api/.env
```

Update values in `apps/api/.env` as needed.

### 3) Run in development

```bash
npm run dev:api
npm run dev:web
```

## Scripts

- `npm run test` → API tests (Jest + supertest)
- `npm run build` → Frontend production build
- `npm run lint` → Frontend lint

## API Base URL

`http://localhost:4000/api`

### Core Endpoints

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /users/me`
- `PATCH /users/me`
- `GET/POST /courses`
- `GET/POST /syllabi`
- `POST /syllabi/:id/upload`
- `PATCH /syllabi/:id/allocation`
- `PATCH /syllabi/:id/topics/:topicId/progress`
- `GET /syllabi/:id/report`
- `GET /syllabi/reports/summary` (supports filters + CSV export)
- `GET /syllabi/:id/download`
- `GET/POST /assignments`
- `POST /assignments/:id/submit`
- `POST /grades`
- `GET /grades/student/:studentId`
- `GET/POST /events`
- `GET/POST /notifications`
- `GET /notifications/stream` (SSE)
- `GET /admin/stats`
- `GET /admin/audit-logs`

## Docker Deployment

```bash
docker compose up --build
```

Services:
- Web: `http://localhost:5173`
- API: `http://localhost:4000`
- MongoDB: `mongodb://localhost:27017`

## Production Hardening Checklist

- Replace JWT secret with secure value
- Configure SMTP and SMS credentials for notifications
- Store uploads in object storage (S3/GCS) for scaling
- Add CI/CD pipeline and environment-specific secrets
- Enable centralized logging and monitoring
