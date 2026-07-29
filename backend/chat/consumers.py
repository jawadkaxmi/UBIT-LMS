import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from accounts.models import User
from .models import Message
from .serializers import MessageSerializer

# Sab ek hi discussion group mein hain
GROUP = 'discussion'


class ChatConsumer(AsyncWebsocketConsumer):
    """
    Discussion chat ka WebSocket handler.

    - connect: sirf logged-in Sir/Students ko andar aane do (Visitor nahi)
    - receive: message DB mein save karo, phir GROUP ke sab logon ko bhejo
    - chat_message: group se aaya message is connection ko send karo
    """

    async def connect(self):
        user = self.scope['user']
        if not user.is_authenticated or user.role == User.Role.VISITOR:
            await self.close()
            return
        self.user = user
        await self.channel_layer.group_add(GROUP, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(GROUP, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        content = (data.get('content') or '').strip()
        if not content:
            return

        message = await self.save_message(content)
        # GROUP ke sab connections ko live bhejo
        await self.channel_layer.group_send(
            GROUP, {'type': 'chat.message', 'message': message}
        )

    async def chat_message(self, event):
        # group_send se aaya -> is client ko forward karo
        await self.send(text_data=json.dumps({'type': 'message', 'message': event['message']}))

    @database_sync_to_async
    def save_message(self, content):
        msg = Message.objects.create(author=self.user, content=content)
        return MessageSerializer(msg).data
