from rest_framework import permissions
from accounts.models import User


class IsAdminOnly(permissions.BasePermission):
    """Sirf Admin (Sir) — students/visitors ko bilkul ijaazat nahi."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.ADMIN
        )
