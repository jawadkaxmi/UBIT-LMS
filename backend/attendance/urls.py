from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import AttendanceRecordViewSet, MyAttendanceView

router = DefaultRouter()
router.register('records', AttendanceRecordViewSet, basename='attendance-record')

urlpatterns = [
    # Student ki apni attendance (sirf published classes)
    path('my/', MyAttendanceView.as_view(), name='my-attendance'),
] + router.urls
