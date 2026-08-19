from django.conf import settings
from django.db import models


class Announcement(models.Model):
    """
    Ek announcement — Sir (Admin) sab students ke liye post karta hai.

    Jaise Google Classroom ka "stream": naya notice, quiz reminder, chhutti,
    waghera. Pinned announcements sabse upar dikhte hain.
    """

    title = models.CharField(
        max_length=200,
        help_text='Short heading, e.g. "Quiz on Friday"',
    )
    body = models.TextField(
        help_text='The full announcement text',
    )
    is_pinned = models.BooleanField(
        default=False,
        help_text='If checked, this announcement stays at the top',
    )

    # Kisne post kiya (Sir). Agar user delete ho jaye to announcement na toote.
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='announcements',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Pinned pehle, phir naye upar
        ordering = ['-is_pinned', '-created_at']

    def __str__(self):
        return self.title
