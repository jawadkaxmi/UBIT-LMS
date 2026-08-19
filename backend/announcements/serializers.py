from rest_framework import serializers
from .models import Announcement


class AnnouncementSerializer(serializers.ModelSerializer):
    """Ek announcement -> JSON (author ka naam bhi, UI ke liye)."""

    author_name = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Announcement
        fields = ('id', 'title', 'body', 'is_pinned', 'author', 'author_name', 'created_at')
        read_only_fields = ('author', 'created_at')
