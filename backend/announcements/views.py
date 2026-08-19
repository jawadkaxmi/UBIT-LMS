from rest_framework import viewsets

from .models import Announcement
from .serializers import AnnouncementSerializer
from .permissions import IsAdminOrReadOnly


class AnnouncementViewSet(viewsets.ModelViewSet):
    """
    Announcements ka poora API — ek hi jagah se:
      GET    /api/announcements/       -> saari announcements (sab logged-in users)
      POST   /api/announcements/       -> nayi announcement (sirf Admin)
      GET    /api/announcements/<id>/  -> ek announcement
      PUT    /api/announcements/<id>/  -> edit (sirf Admin)
      DELETE /api/announcements/<id>/  -> delete (sirf Admin)

    Security IsAdminOrReadOnly se aati hai (permissions.py).
    """
    queryset = Announcement.objects.select_related('author').all()
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAdminOrReadOnly]

    def perform_create(self, serializer):
        # Author khud-ba-khud logged-in Sir set ho (frontend se nahi aata)
        serializer.save(author=self.request.user)
