from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    User model ko Django admin panel mein dikhane ke liye.
    UserAdmin extend karte hain taaki username/password ka
    built-in interface mile, aur usmein 'role' bhi add karte hain.
    """

    # User list mein ye columns dikhein
    list_display = ('username', 'email', 'role', 'is_staff', 'is_active')
    # Right side filter — role ke hisaab se filter kar sakein
    list_filter = ('role', 'is_staff', 'is_active')

    # User edit page par 'role' field ke liye ek naya section
    fieldsets = UserAdmin.fieldsets + (
        ('LMS Role', {'fields': ('role',)}),
    )
    # Naya user banate waqt bhi 'role' choose kar sakein
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('LMS Role', {'fields': ('role',)}),
    )
