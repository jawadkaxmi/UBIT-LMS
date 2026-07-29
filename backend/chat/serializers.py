from rest_framework import serializers
from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    """Ek message → JSON (author ka naam aur role bhi, UI ke liye)."""

    author_name = serializers.CharField(source='author.username', read_only=True)
    author_role = serializers.CharField(source='author.role', read_only=True)

    class Meta:
        model = Message
        fields = ('id', 'author', 'author_name', 'author_role', 'content', 'created_at')
        read_only_fields = ('author', 'created_at')
