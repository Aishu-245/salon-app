# Beauty Salon Appointment & Stylist Management System

Full-stack salon appointment platform built with **React + Vite**, **Node.js + Express**, and **SQLite**.

## Live Demo

| | URL |
|---|---|
| 🌐 Frontend | https://YOUR_GITHUB_USERNAME.github.io/salon-app/ |
| ⚙️ Backend API | https://salon-app-backend.onrender.com |

## Demo Credentials

Password for all accounts: `password123`

| Role | Email |
|---|---|
| Admin | admin@salon.com |
| Stylist | priya@salon.com |
| Customer | customer@salon.com |

## Project Structure

```
salon-app/
  client/   # React + Vite frontend
  server/   # Express + SQLite backend
  .github/workflows/deploy.yml   # GitHub Actions (auto-deploys frontend)
  render.yaml                    # Render.com backend config
```

## Local Setup

### Backend
```bash
cd salon-app/server
npm install
node src/index.js
```
Server auto-seeds the database on first run. Runs on `http://localhost:4000`.

### Frontend
```bash
cd salon-app/client
npm install
npm run dev
```
Runs on `http://localhost:5173`.

## Environment Variables

**Frontend** (`client/.env`):
```
VITE_API_BASE_URL=http://localhost:4000
```

**Backend** — no `.env` required locally. For production, set `PORT` if needed.

## Database

SQLite database file is created automatically at `server/data.db` on first run. Demo data is seeded automatically (users, services, stylists, appointments).

To reset: delete `server/data.db` and restart the server.

## API Endpoints

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | /api/auth/login | Public | Login |
| POST | /api/auth/logout | Any | Logout |
| GET | /api/services | Public | List services |
| POST | /api/services | Admin | Create service |
| GET | /api/services/categories | Public | List categories |
| POST | /api/services/categories | Admin | Create category |
| GET | /api/stylists | Public | List stylists |
| POST | /api/stylists | Admin | Create stylist |
| PUT | /api/stylists/:id | Admin | Update stylist |
| GET | /api/stylists/availability | Public | Check availability |
| GET | /api/stylists/:id/schedule | Auth | Daily schedule |
| POST | /api/appointments | Auth | Book appointment |
| GET | /api/appointments | Auth | List appointments |
| PUT | /api/appointments/:id/status | Admin/Stylist | Update status |
| GET | /api/dashboard/salon | Admin | Dashboard metrics |
| GET | /api/health | Public | Health check |

## Deployment

### Backend → Render.com (free)
1. Push code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Root directory: `server`, Build: `npm install`, Start: `node src/index.js`
5. Copy the Render URL (e.g. `https://salon-app-backend.onrender.com`)

### Frontend → GitHub Pages (auto via GitHub Actions)
1. Go to your GitHub repo → **Settings → Pages → Source → GitHub Actions**
2. Go to **Settings → Variables → Repository variables**
3. Add variable: `VITE_API_BASE_URL` = your Render backend URL
4. Push to `main` branch — GitHub Actions builds and deploys automatically

## Screenshots

![Services Page](screenshots/services.png)
![Booking Page](screenshots/booking.png)
![Dashboard](screenshots/dashboard.png)

## Submission Links

- **GitHub Repository:** https://github.com/YOUR_USERNAME/salon-app
- **Live App:** https://YOUR_USERNAME.github.io/salon-app/
- **Video Recording:** (add link)
