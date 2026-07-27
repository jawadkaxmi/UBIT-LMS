from rest_framework import serializers
from .models import Teacher


class TeacherSerializer(serializers.ModelSerializer):
    """Teacher ko JSON mein badalne ke liye (API ke liye)."""

    class Meta:
        model = Teacher
        fields = (
            'id', 'name', 'email', 'designation',
            'is_active', 'removal_reason', 'removed_at', 'created_at',
        )
        # Ye fields seedhे edit nahi hote — soft-delete (deactivate) action
        # aur system inhe set karta hai.
        read_only_fields = ('is_active', 'removal_reason', 'removed_at', 'created_at')
