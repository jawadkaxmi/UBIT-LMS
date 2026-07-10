from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """
    User model ko JSON mein badalne ke liye.
    Ye woh fields hain jo API (React) ko bhejenge —
    password kabhi nahi bhejte (security).
    """

    # role ka poora naam bhi bhejte hain (e.g. 'STUDENT' ke saath 'Student')
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'role_display')
