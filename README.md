# UBIT Learning Management System (LMS)

A full-stack Learning Management System developed collaboratively as a university project for the Department of Computer Science (UBIT), University of Karachi.

The platform helps teachers and students manage online classes, attendance, recorded lectures, and real-time communication.

## Features

- **Role-based authentication** for Admin, Student, and Visitor accounts
- **Class management** with scheduling and Google Meet integration
- **Teacher management** with removal and reactivation
- **Attendance tracking** with join/leave records, manual editing, and publishing
- **Recorded lectures** with YouTube videos and clickable chapter timestamps
- **Real-time group chat** using WebSockets, with admin moderation

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, CSS |
| Backend | Python, Django, Django REST Framework |
| Real-time communication | Django Channels, WebSockets |
| Database | SQLite, PostgreSQL |
| Authentication | JWT |
| Live classes | Google Meet integration |

## Project Structure

- `backend/` — Django backend, REST APIs, and WebSocket functionality
- `frontend/` — React application

## Run Locally

### Backend

Open a terminal in the project directory:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:

**Windows**
```bash
venv\Scripts\activate
```

**macOS / Linux**
```bash
source venv/bin/activate
```

Install dependencies and start the backend:

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.
## Developers

Collaboratively developed by:

- [jawadkaxmi](https://github.com/jawadkaxmi)
- [umer29github](https://github.com/umer29github)

## Academic Project

Department of Computer Science (UBIT), University of Karachi.
