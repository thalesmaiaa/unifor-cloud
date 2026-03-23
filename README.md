# 📋 Project Manager — Cloud Computing Project

A full-stack **Project Management Platform** built with **React** (frontend) and **FastAPI** (backend), containerized with Docker and ready for cloud deployment.

## 🏗 Architecture

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│   Frontend   │──────▶│   Backend API    │──────▶│  PostgreSQL   │
│   (React)    │       │   (FastAPI)      │       │  (Cloud DB)   │
│   Vercel     │       │   Docker/Render  │       │  Supabase/RDS │
└──────────────┘       └──────────────────┘       └──────────────┘
```

## ✅ Requirements Checklist

| Requirement                | Implementation                                     |
| -------------------------- | -------------------------------------------------- |
| Use case elaborado         | Project management with multi-profile (admin/user) |
| Autenticação e autorização | JWT auth + role-based access control               |
| API RESTful documentada    | FastAPI auto-generated Swagger at `/docs`          |
| Operações CRUD completas   | Users, Projects, Tasks — full CRUD                 |
| Validação de dados         | Pydantic schemas with field validation             |
| Registro de logs           | Activity logs (DB) + request logging middleware    |
| Front-end moderno          | React 18 + Vite                                    |
| Deploy front-end           | Ready for Vercel / Netlify                         |
| Back-end containerizado    | Dockerfile included                                |
| Deploy back-end            | Ready for Render / Railway / AWS                   |
| Banco de dados gerenciado  | PostgreSQL (Supabase / RDS compatible)             |
| Docker                     | `Dockerfile` + `docker-compose.yml`                |
| CI/CD pipeline             | GitHub Actions (build → test → deploy)             |

## 🚀 Quick Start

### Prerequisites

- Python 3.12+
- Node.js 20+
- Docker (optional, for containerized run)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # macOS/Linux
pip install -r requirements.txt

# Copy env file and adjust values
cp .env.example .env

# Run (uses SQLite by default for development)
uvicorn app.main:app --reload
```

API Docs: http://localhost:8000/docs

**Default admin account:** `admin@example.com` / `admin123`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

### Docker (full stack)

```bash
docker compose up --build
```

- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

Then start the frontend separately with `npm run dev`.

## 🧪 Running Tests

### Backend

```bash
cd backend
pytest tests/ -v
```

### Frontend

```bash
cd frontend
npm test
```

## 📁 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Settings & environment
│   │   ├── database.py          # SQLAlchemy setup
│   │   ├── dependencies.py      # Auth dependencies
│   │   ├── models/              # SQLAlchemy models
│   │   │   ├── user.py
│   │   │   ├── project.py
│   │   │   ├── task.py
│   │   │   └── activity_log.py
│   │   ├── schemas/             # Pydantic schemas
│   │   │   ├── user.py
│   │   │   ├── project.py
│   │   │   └── task.py
│   │   ├── routers/             # API endpoints
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── projects.py
│   │   │   ├── tasks.py
│   │   │   └── logs.py
│   │   ├── services/
│   │   │   └── auth.py          # JWT & password hashing
│   │   └── middleware/
│   │       └── logging.py       # Request logging
│   ├── tests/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── docker-compose.yml
├── frontend/
│   ├── src/
│   │   ├── components/          # Navbar, ProtectedRoute
│   │   ├── context/             # AuthContext
│   │   ├── pages/               # All pages
│   │   ├── services/            # API client (axios)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── .github/workflows/ci-cd.yml  # CI/CD pipeline
├── docker-compose.yml
└── README.md
```

## 🔐 API Endpoints

| Method | Endpoint                  | Description              | Auth  |
| ------ | ------------------------- | ------------------------ | ----- |
| POST   | `/api/auth/register`      | Register new user        | —     |
| POST   | `/api/auth/login`         | Login & get JWT          | —     |
| GET    | `/api/auth/me`            | Get current user         | ✅    |
| GET    | `/api/users/`             | List all users           | Admin |
| PUT    | `/api/users/:id`          | Update user              | ✅    |
| DELETE | `/api/users/:id`          | Delete user              | Admin |
| POST   | `/api/projects/`          | Create project           | ✅    |
| GET    | `/api/projects/`          | List projects (filtered) | ✅    |
| GET    | `/api/projects/:id`       | Get project              | ✅    |
| PUT    | `/api/projects/:id`       | Update project           | ✅    |
| DELETE | `/api/projects/:id`       | Delete project           | ✅    |
| POST   | `/api/tasks/`             | Create task              | ✅    |
| GET    | `/api/tasks/?project_id=` | List project tasks       | ✅    |
| GET    | `/api/tasks/:id`          | Get task                 | ✅    |
| PUT    | `/api/tasks/:id`          | Update task              | ✅    |
| DELETE | `/api/tasks/:id`          | Delete task              | ✅    |
| GET    | `/api/logs/`              | List activity logs       | Admin |
| GET    | `/api/logs/my`            | My activity logs         | ✅    |

## ☁️ Deployment Guide

### Backend → Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. Set **Build Command**: `pip install -r requirements.txt`
5. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables (`DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS`)

### Database → Supabase

1. Create a project on [Supabase](https://supabase.com)
2. Copy the PostgreSQL connection string
3. Set it as `DATABASE_URL` on Render

### Frontend → Vercel

1. Import your repo on [Vercel](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Set **Build Command**: `npm run build`
4. Set **Output Directory**: `dist`
5. Add env var `VITE_API_URL` pointing to your Render backend URL

## 📝 License

University project — Cloud Computing @ UNIFOR.
