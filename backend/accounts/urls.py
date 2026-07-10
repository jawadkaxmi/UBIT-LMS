from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,   # login — username+password se token deta hai
    TokenRefreshView,      # expire hone par naya access token deta hai
)
from .views import MeView

urlpatterns = [
    # Login: POST username+password -> access & refresh token milta hai
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # Refresh: POST refresh token -> naya access token
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Current user ki details (login ke baad)
    path('me/', MeView.as_view(), name='me'),
]
