from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from classes.models import ClassSession
from .models import Lecture
from .serializers import LectureSerializer
from .permissions import IsAdminOrReadOnly


class LectureListView(ListAPIView):
    """
    GET /api/lectures/
    Saari recorded lectures (Lectures panel ke liye).
    """
    queryset = Lecture.objects.select_related('class_session').all()
    serializer_class = LectureSerializer
    permission_classes = [IsAuthenticated]


class ClassLectureView(APIView):
    """
    Ek class ki recording:
      GET    /api/classes/<id>/lecture/  -> dekhna (sab)
      PUT    /api/classes/<id>/lecture/  -> add/update (Admin)
      DELETE /api/classes/<id>/lecture/  -> hataना (Admin)
    """
    permission_classes = [IsAdminOrReadOnly]

    def get(self, request, class_id):
        class_session = get_object_or_404(ClassSession, pk=class_id)
        lecture = getattr(class_session, 'lecture', None)
        if lecture is None:
            return Response({'detail': 'No recording for this class yet.'},
                            status=status.HTTP_404_NOT_FOUND)
        return Response(LectureSerializer(lecture).data)

    def put(self, request, class_id):
        # Add ya update (jo pehle se ho use badal do, warna naya banao)
        class_session = get_object_or_404(ClassSession, pk=class_id)
        lecture = getattr(class_session, 'lecture', None)

        serializer = LectureSerializer(instance=lecture, data=request.data, partial=bool(lecture))
        serializer.is_valid(raise_exception=True)
        serializer.save(class_session=class_session)
        return Response(serializer.data)

    def delete(self, request, class_id):
        class_session = get_object_or_404(ClassSession, pk=class_id)
        lecture = getattr(class_session, 'lecture', None)
        if lecture is not None:
            lecture.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
