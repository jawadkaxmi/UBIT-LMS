from django.urls import path
from .consumers import ChatConsumer

# WebSocket URL — frontend yahan connect karega
websocket_urlpatterns = [
    path('ws/chat/', ChatConsumer.as_asgi()),
]
