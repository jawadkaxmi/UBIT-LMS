from django.contrib import admin
from .models import PresenceLog, AttendanceRecord


@admin.register(PresenceLog)
class PresenceLogAdmin(admin.ModelAdmin):
    """Har join/leave ka raw record (debugging/checking ke liye)."""

    list_display = ('student', 'class_session', 'joined_at', 'left_at')
    list_filter = ('class_session',)
    search_fields = ('student__username',)


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    """Final attendance sheet ki rows."""

    list_display = (
        'student', 'class_session', 'status',
        'join_count', 'total_minutes', 'manually_edited',
    )
    list_filter = ('status', 'class_session')
    search_fields = ('student__username',)
