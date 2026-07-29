from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken

from accounts.models import User


@database_sync_to_async
def get_user(user_id):
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    """
    WebSocket par login verify karna.

    REST mein token header mein aata hai, lekin WebSocket headers set karna
    mushkil hai — isliye token URL ke query mein aata hai:
        ws://.../ws/chat/?token=<access_token>
    Yahan hum us token se user pehchante hain aur scope['user'] set karte hain.
    """

    async def __call__(self, scope, receive, send):
        query = parse_qs(scope.get('query_string', b'').decode())
        token = query.get('token', [None])[0]

        scope['user'] = AnonymousUser()
        if token:
            try:
                access = AccessToken(token)  # signature + expiry verify
                scope['user'] = await get_user(access['user_id'])
            except Exception:
                pass  # galat/expire token -> Anonymous rahega

        return await super().__call__(scope, receive, send)
