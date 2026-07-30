FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Hugging Face Spaces is port par app chahti hai
EXPOSE 7860

# Start: database migrate -> static files collect -> Daphne (ASGI) server chalu
CMD python manage.py migrate --noinput && \
    python manage.py collectstatic --noinput && \
    daphne -b 0.0.0.0 -p 7860 lms_backend.asgi:application
