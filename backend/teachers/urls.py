from rest_framework.routers import DefaultRouter
from .views import TeacherViewSet

# Router khud saare CRUD routes + deactivate action bana deta hai
router = DefaultRouter()
router.register('teachers', TeacherViewSet, basename='teacher')

urlpatterns = router.urls
