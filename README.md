# LMS — Learning Management System

University CS Department ke liye ek Learning Management System (LMS) web app.
Final Year Project (FYP) + real production system.

Ek teacher ("Sir") apni class manage kar sakta hai: classes announce karna,
online (Google Meet) classes lena, recorded lectures upload karna, attendance
track karna, students se discussion chat — ek self-built mini-Coursera +
Google Classroom.

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React (Vite) + plain CSS (`app.css`)|
| Backend    | Django + Django REST Framework      |
| Database   | SQLite (dev) → PostgreSQL (production) |
| Auth       | JWT (role-based)                    |
| Live class | Google Meet + in-LMS Join/Leave     |

## Roles

- **Admin (Sir)** — full control: users banana, classes manage karna, content delete karna
- **Student** — Sir dwara diya gaya unique id/password se login
- **Visitor** — jo enrolled nahi, woh visitor ke roop mein dikhega

## Folder Structure

```
LMS/
├── backend/      # Django + DRF (saara backend / API)
└── frontend/     # React (saara frontend / UI)
```

## Setup (chalane ka tareeqa)

> Note: Setup steps yahan add hote jayenge jaise project aage badhega.

### Backend
```
cd backend
venv\Scripts\activate     # virtual environment activate karna (Windows)
# (Django install + run steps — Step 2 mein aayenge)
```

### Frontend
```
cd frontend
# (React setup steps — baad mein aayenge)
```
