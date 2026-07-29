# LMS — Learning Management System

A Learning Management System (LMS) web app built for a university CS department
(UBIT, University of Karachi). It is a Final Year Project as well as a system
intended for real use.

A teacher ("Sir") can run their class online: announce classes, hold live
sessions on Google Meet, upload recorded lectures with chapters, track
attendance automatically, and discuss with students in a real-time chat — a
self-built mini-Coursera + Google Classroom.

## Features

- **Role-based access** — Admin (teacher), Student, and Visitor, secured with JWT login.
- **Classes** — announce classes (course, topic, date, time, Google Meet link, teacher); start/end a class.
- **Teachers** — manage a teacher list with soft-delete (removal reason) and reactivation.
- **Attendance** — automatic join/leave tracking, "Take Attendance" snapshot, manual edit, and publish; students get their own attendance panel.
- **Recorded lectures** — YouTube-based recordings with clickable chapter timestamps (Coursera-style).
- **Real-time discussion chat** — WebSocket-based group chat between the teacher and students, with admin moderation.

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React (Vite) + plain CSS (`app.css`)    |
| Backend    | Django + Django REST Framework          |
| Real-time  | Django Channels (WebSockets)            |
| Database   | SQLite (dev) → PostgreSQL (production)  |
| Auth       | JWT (role-based)                        |
| Live class | Google Meet + in-app Join/Leave tracking |

## Roles

- **Admin (Sir)** — full control: create users, manage classes/teachers, take attendance, moderate chat.
- **Student** — logs in with a unique id/password issued by the teacher.
- **Visitor** — a signed-in user who is not enrolled; sees a limited view.

## Project Structure

```
LMS/
├── backend/      # Django + DRF + Channels (API, WebSockets)
└── frontend/     # React (UI)
```

## Getting Started (local development)

Requirements: Python 3.12+ and Node.js 18+.

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate            # Windows (use: source venv/bin/activate on macOS/Linux)
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # create the first admin
python manage.py runserver        # runs at http://127.0.0.1:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                       # runs at http://localhost:5173
```

Open http://localhost:5173 and log in with the admin account you created.

## Configuration

The backend reads configuration from environment variables (with local-friendly
defaults, so it runs on SQLite out of the box):

| Variable | Purpose |
|----------|---------|
| `SECRET_KEY` | Django secret key (set in production) |
| `DEBUG` | `True` locally, `False` in production |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts |
| `DATABASE_URL` | If set, uses PostgreSQL; otherwise SQLite |
| `REDIS_URL` | If set, uses Redis as the channel layer; otherwise in-memory |
| `CORS_ALLOWED_ORIGINS` | Comma-separated frontend origins |

The frontend reads `VITE_API_URL` and `VITE_WS_URL` (falling back to
`localhost` for development).

## License

Final Year Project — Department of Computer Science, UBIT, University of Karachi.
