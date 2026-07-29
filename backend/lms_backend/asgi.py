"""
ASGI config for lms_backend project.

Do tarah ki requests handle hoti hain:
  - HTTP    -> normal Django (REST API, admin)
  - WebSocket -> Channels (real-time chat)
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms_backend.settings')

# Django ko pehle setup karo, phir channels ki cheezein import karo
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter  # noqa: E402

from chat.middleware import JWTAuthMiddleware  # noqa: E402
from chat.routing import websocket_urlpatterns  # noqa: E402

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    # WebSocket: pehle JWT se user pehchano, phir sahi consumer tak bhejo
    'websocket': JWTAuthMiddleware(URLRouter(websocket_urlpatterns)),
})
