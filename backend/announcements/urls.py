from rest_framework.routers import DefaultRouter
from .views import AnnouncementViewSet

# Router khud saare CRUD routes bana deta hai (list/create/detail/update/delete)
router = DefaultRouter()
router.register('announcements', AnnouncementViewSet, basename='announcement')

urlpatterns = router.urls
