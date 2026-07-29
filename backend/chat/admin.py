from django.contrib import admin
from .models import Message


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    """Messages ko admin panel mein dikhane/delete karne ke liye."""

    list_display = ('author', 'content', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('content', 'author__username')
