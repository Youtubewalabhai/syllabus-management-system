# StudentOS - Complete Student Ecosystem Platform

A monorepo implementation of **StudentOS** with:

- `apps/web`: Next.js + React + Tailwind + Framer Motion + Redux Toolkit frontend
- `apps/api`: Node.js + Express.js + MongoDB backend with JWT auth and core APIs

## Implemented foundation

### Frontend
- Modern landing page with key sections (hero, updates, notices/resources, placements, events, testimonials-ready blocks)
- Student dashboard shell with core widget cards
- Light/dark mode support
- Redux Toolkit state setup
- Framer Motion section animations

### Backend
- Security middlewares (Helmet, CORS, rate limiting)
- JWT-based authentication endpoints:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `GET /api/v1/auth/me`
- Core catalog endpoints:
  - `GET /api/v1/catalog/overview`
  - `GET /api/v1/catalog/resources`
  - `GET /api/v1/catalog/notices`
  - `GET /api/v1/catalog/events`
  - `GET /api/v1/catalog/placements`
- MongoDB schemas for User, Notice, Resource, Event, Placement
- Seed script for sample data

## Folder structure

```
.
├── apps
│   ├── api
│   │   ├── scripts/seed.js
│   │   ├── src
│   │   │   ├── app.js
│   │   │   ├── server.js
│   │   │   ├── config/env.js
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   └── services/
│   │   └── tests/app.test.js
│   └── web
│       ├── pages/
│       ├── store/
│       └── styles/
├── package.json
└── README.md
```

## Run locally

```bash
npm install
npm run dev:api
npm run dev:web
```

### Environment setup
Copy and configure:

```bash
cp apps/api/.env.example apps/api/.env
```

## Testing

```bash
npm test
```

## Deployment guide

### Frontend (Vercel)
1. Import repository in Vercel.
2. Set root directory to `apps/web`.
3. Build command: `npm run build`
4. Output defaults to Next.js runtime.

### Backend (Render)
1. Create a new Web Service.
2. Root directory: `apps/api`.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables from `.env.example`.

### Database (MongoDB Atlas)
1. Create cluster and database `studentos`.
2. Create user credentials and whitelist backend IP.
3. Set `MONGO_URI` in Render environment settings.

## Notes
This repository now contains a startup-grade **foundation architecture** for StudentOS with extensible module boundaries for Attendance, Timetable, AI Assistant, Career, Community, and Admin analytics expansion.
