FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Render (aur koi bhi host) apna PORT env var deta hai — app usi par sune.
# Local docker ke liye default 7860.
EXPOSE 7860

# Start: database migrate -> static files collect -> Daphne (ASGI) server chalu
CMD python manage.py migrate --noinput && \
    python manage.py collectstatic --noinput && \
    daphne -b 0.0.0.0 -p ${PORT:-7860} lms_backend.asgi:application
