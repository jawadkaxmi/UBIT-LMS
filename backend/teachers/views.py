from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Teacher
from .serializers import TeacherSerializer
from .permissions import IsAdminOrReadOnly


class TeacherViewSet(viewsets.ModelViewSet):
    """
    Teachers ka API:
      GET    /api/teachers/              -> list
      POST   /api/teachers/              -> naya teacher (Admin)
      PUT    /api/teachers/<id>/         -> edit (Admin)
      POST   /api/teachers/<id>/deactivate/ -> SOFT delete + reason (Admin)
      POST   /api/teachers/<id>/reactivate/ -> wapas active (Admin)
    """
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [IsAdminOrReadOnly]

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """
        Soft delete — teacher hatao par record safe rakho.
        Frontend se reason bheja jata hai: {"reason": "Left the institute"}.
        """
        teacher = self.get_object()
        teacher.is_active = False
        teacher.removal_reason = request.data.get('reason', '')
        teacher.removed_at = timezone.now()
        teacher.save()
        return Response(self.get_serializer(teacher).data)

    @action(detail=True, methods=['post'])
    def reactivate(self, request, pk=None):
        """Hataya hua teacher wapas active karo (removal info saaf)."""
        teacher = self.get_object()
        teacher.is_active = True
        teacher.removal_reason = ''
        teacher.removed_at = None
        teacher.save()
        return Response(self.get_serializer(teacher).data)
