from django.conf import settings
from django.db import models


class Message(models.Model):
    """
    Discussion channel ka ek message.

    Abhi ek hi common "Discussion" channel hai (Sir + students), isliye
    koi channel/course field nahi — saare messages ek hi dhaare mein.
    History database mein save rehti hai; naye messages WebSocket se live
    broadcast honge (Step 22).
    """

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='messages',
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        preview = self.content[:40]
        return f'{self.author.username}: {preview}'
