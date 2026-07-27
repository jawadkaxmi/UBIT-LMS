from django.contrib import admin
from .models import ClassSession


@admin.register(ClassSession)
class ClassSessionAdmin(admin.ModelAdmin):
    """ClassSession ko admin panel mein dikhane ke liye."""

    # List mein ye columns dikhein
    list_display = ('title', 'teacher', 'date', 'start_time', 'created_at')
    # Date aur teacher ke hisaab se filter
    list_filter = ('date', 'teacher')
    # Title/description se search
    search_fields = ('title', 'description')
