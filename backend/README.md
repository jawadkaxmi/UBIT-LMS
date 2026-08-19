# UBIT LMS — Backend

Backend API for the UBIT LMS: **Django + Django REST Framework + Channels**
(WebSockets), with **JWT** authentication. Uses **PostgreSQL** in production and
**SQLite** locally.

## Deployment

Deployed as a **Docker** container on **Render** (see [Dockerfile](Dockerfile)).
On start, the container runs `migrate` → `collectstatic` → **Daphne** (ASGI)
bound to the host's `$PORT`. The production database is **Neon PostgreSQL**
(`DATABASE_URL`); static files are served by **WhiteNoise**.

- Live backend: https://ubit-lms-backend.onrender.com
- Admin panel: https://ubit-lms-backend.onrender.com/admin/

## Local development

```
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Configuration comes from environment variables — `SECRET_KEY`, `DEBUG`,
`ALLOWED_HOSTS`, `DATABASE_URL`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS` —
with local-friendly defaults, so it runs on SQLite out of the box.
