from rest_framework.routers import DefaultRouter
from .views import MessageViewSet

router = DefaultRouter()
router.register('chat/messages', MessageViewSet, basename='message')

urlpatterns = router.urls
