from rest_framework import mixins, viewsets
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated

from .models import AttendanceRecord
from .serializers import AttendanceRecordSerializer
from .permissions import IsAdminOnly


class MyAttendanceView(ListAPIView):
    """
    GET /api/attendance/my/

    Logged-in student ki APNI attendance — sirf un classes ki jinki
    attendance PUBLISH ho chuki hai (draft chhupi rehti hai).
    """
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            AttendanceRecord.objects
            .filter(
                student=self.request.user,
                class_session__attendance_published=True,
            )
            .select_related('class_session')
            .order_by('-class_session__date')
        )


class AttendanceRecordViewSet(mixins.RetrieveModelMixin,
                              mixins.UpdateModelMixin,
                              viewsets.GenericViewSet):
    """
    Sir ke liye — kisi student ki attendance MANUALLY edit karna:
      PATCH /api/attendance/records/<id>/   body: {"status": "PRESENT"}

    (Nayi record yahan se nahi banti — wo "Take Attendance" se banti hai.)
    """
    queryset = AttendanceRecord.objects.all()
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsAdminOnly]

    def perform_update(self, serializer):
        # Nishaan laga do ki ye manually badla gaya — taaki dobara attendance
        # lene par ye status overwrite na ho.
        serializer.save(manually_edited=True)
