from django.urls import path
from .views import DashboardView

urlpatterns = [
    # Role-based dashboard data (tiles + charts)
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
]
