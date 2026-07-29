from rest_framework import mixins, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated

from accounts.models import User
from .models import Message
from .serializers import MessageSerializer


class MessageViewSet(mixins.ListModelMixin,
                     mixins.DestroyModelMixin,
                     viewsets.GenericViewSet):
    """
    Chat history + moderation:
      GET    /api/chat/messages/       -> purani messages (page khulte hi load)
      DELETE /api/chat/messages/<id>/  -> message delete (SIRF Admin/Sir)

    Naye messages REST se nahi — WebSocket se aate/jaate hain (live).
    """
    queryset = Message.objects.select_related('author').all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Visitor enrolled nahi — koi chat nahi
        if self.request.user.role == User.Role.VISITOR:
            return Message.objects.none()
        return super().get_queryset()

    def destroy(self, request, *args, **kwargs):
        # Sirf Sir kisi bhi message ko delete kar sakta hai (moderation)
        if request.user.role != User.Role.ADMIN:
            raise PermissionDenied('Only the admin can delete messages.')
        return super().destroy(request, *args, **kwargs)
