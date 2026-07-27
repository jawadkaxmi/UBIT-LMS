from rest_framework.routers import DefaultRouter
from .views import ClassSessionViewSet

# Router khud saare CRUD routes bana deta hai (list/create/detail/update/delete)
router = DefaultRouter()
router.register('classes', ClassSessionViewSet, basename='classsession')

urlpatterns = router.urls
