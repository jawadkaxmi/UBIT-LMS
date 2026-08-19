# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

An LMS for the UBIT (University of Karachi) CS department. It is simultaneously a **Final Year Project** and a system **intended for real production use** by one teacher ("Sir") and their students — a self-built mini-Coursera + Google Classroom. Design decisions favor a single-teacher, single-department model, not a multi-tenant SaaS.

Two top-level folders, kept separate: `backend/` (Django) and `frontend/` (React/Vite).

## Working conventions (enforced — do not deviate)

- **All frontend CSS lives in one file:** `frontend/src/app.css`, organized with section comments. No Tailwind, no CSS modules, no per-component stylesheets.
- **Language split is intentional:** every user-facing string — Django admin `help_text` and labels, DRF/API messages, React UI text — must be professional **English**. Code **comments** are written in **Roman Urdu** on purpose; do not "translate" or remove them. Older migration files also contain Roman Urdu strings (frozen history, never shown in UI) — leave them.
- **This user works one step at a time.** Before creating or editing files, preview *which files change and what goes in them*, wait for confirmation, then execute, then recap. The user reads/writes Roman Urdu; reply in Roman Urdu mixed with English technical terms.

## Commands

Backend (run from `backend/`, with venv activated: `venv\Scripts\activate`):
```powershell
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser        # first admin (role must be set to ADMIN)
python manage.py runserver              # http://127.0.0.1:8000  (serves HTTP + WebSocket via Daphne)
python manage.py test                   # all tests
python manage.py test classes.tests.ClassTests.test_x   # a single test
python manage.py makemigrations         # after model changes
```

Frontend (run from `frontend/`):
```powershell
npm install
npm run dev        # http://localhost:5173
npm run lint       # oxlint
npm run build      # production build (Vercel runs this)
```

## Architecture

### Dual-protocol backend (ASGI)
The backend serves **two protocols** through one ASGI app ([backend/lms_backend/asgi.py](backend/lms_backend/asgi.py)):
- **HTTP** → Django/DRF (REST API under `/api/`, admin under `/admin/`).
- **WebSocket** → Django Channels (real-time chat at `ws://…/ws/chat/`).

`daphne` must stay at the **top of `INSTALLED_APPS`** so `runserver` uses the ASGI server. The channel layer is **in-memory by default** (fine for a single instance) and switches to Redis only if `REDIS_URL` is set.

### Authentication — two paths for one JWT
- **REST:** SimpleJWT via `Authorization: Bearer <token>` header. The frontend attaches it from `localStorage` in an axios interceptor ([frontend/src/api.js](frontend/src/api.js)).
- **WebSocket:** headers aren't practical, so the token is passed as a query param `?token=<access>` and verified in [backend/chat/middleware.py](backend/chat/middleware.py) (`JWTAuthMiddleware`), which sets `scope['user']`.

### Roles gate everything
`AUTH_USER_MODEL = accounts.User` extends `AbstractUser` with a `role` field: **ADMIN** (Sir), **STUDENT**, **VISITOR** (default). Roles are checked throughout: visitors can't join classes or connect to chat; only admins create/edit classes and see unpublished attendance. Because this is a custom user model, migration ordering matters — a fresh DB must migrate `accounts` before `admin`.

### `Teacher` is NOT a `User`
[backend/teachers/](backend/teachers/) `Teacher` is a **managed list** for the class dropdown, independent of login accounts. It uses **soft delete** (`is_active=False` + `removal_reason` + `removed_at`) so a removed teacher's name is preserved on past classes. Don't conflate `Teacher` with the `User`/role system.

### Attendance is the core domain logic (read before touching)
Lives in [backend/attendance/](backend/attendance/) and the class-lifecycle actions in [backend/classes/views.py](backend/classes/views.py):
- **`PresenceLog`** = one join→leave span. `left_at IS NULL` means "currently in the class." A student can have many logs per class (re-joins).
- **`take_attendance`** ([backend/attendance/services.py](backend/attendance/services.py)) is the rule: a student is **PRESENT iff they have an open log at the moment attendance is taken**; everyone else is ABSENT. It also aggregates `join_count` / `total_minutes` / first/last join.
- **`AttendanceRecord`** = final sheet row, unique per `(class_session, student)`. `manually_edited=True` protects an admin's manual status change from being overwritten on a re-take (details still refresh).
- **`ClassSession.end`** runs `take_attendance` **before** closing open logs — order is critical, otherwise everyone would be marked absent. Attendance stays a **draft** (`attendance_published=False`) until the admin publishes; students only see it once published.

`ClassSessionViewSet` custom actions: `join`, `leave`, `start`, `end`, `take_attendance`, `publish_attendance`, `attendance`.

### Lectures
[backend/lectures/](backend/lectures/) `Lecture` is `OneToOne` with `ClassSession`. `chapters` is a `JSONField` list of `{"title", "time"}` where `time` is **seconds** (for click-to-seek, Coursera-style).

### Frontend structure
`App.jsx` defines routes; `Layout.jsx` wraps all authenticated pages with the role-aware sidebar; `Login` sits outside it. Pages live in `frontend/src/pages/`, shared modals in `frontend/src/components/`.

## Configuration & deployment

Config is **entirely environment-variable driven, with local-friendly defaults**, so the backend runs on SQLite + in-memory channels with zero setup. Key vars ([backend/lms_backend/settings.py](backend/lms_backend/settings.py)): `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `DATABASE_URL` (set → PostgreSQL via `dj-database-url`, else SQLite), `REDIS_URL`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`. Frontend uses `VITE_API_URL` and `VITE_WS_URL`.

Deployment: the backend runs as a **Docker** container on **Render** (https://ubit-lms-backend.onrender.com) — [backend/Dockerfile](backend/Dockerfile) does migrate → collectstatic → Daphne bound to `$PORT`. Postgres on **Neon**; the frontend (Vite build) on **Vercel** (https://dcs-ubit-lms.vercel.app). WhiteNoise serves static files in production.
