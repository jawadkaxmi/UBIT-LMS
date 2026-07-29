"""
URL configuration for lms_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # Saare accounts API routes (/api/token/, /api/token/refresh/, /api/me/)
    path('api/', include('accounts.urls')),
    # Classes API routes (/api/classes/)
    path('api/', include('classes.urls')),
    # Teachers API routes (/api/teachers/)
    path('api/', include('teachers.urls')),
    # Chat REST routes (history + delete) — live messages WebSocket se
    path('api/', include('chat.urls')),
    # Attendance API routes (/api/attendance/records/...)
    path('api/attendance/', include('attendance.urls')),
    # Lectures API routes (/api/lectures/, /api/classes/<id>/lecture/)
    path('api/', include('lectures.urls')),
    # DRF browsable API ke login/logout (browser mein API test karne ke liye)
    path('api-auth/', include('rest_framework.urls')),
]
