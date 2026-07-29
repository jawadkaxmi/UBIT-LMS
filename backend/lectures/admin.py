from django.contrib import admin
from .models import Lecture


@admin.register(Lecture)
class LectureAdmin(admin.ModelAdmin):
    """Recorded lectures ko admin panel mein dikhane ke liye."""

    list_display = ('__str__', 'class_session', 'youtube_url', 'created_at')
    search_fields = ('title', 'class_session__title')
