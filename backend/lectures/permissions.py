from rest_framework import permissions
from accounts.models import User


class IsAdminOrReadOnly(permissions.BasePermission):
    """Read sabke liye; add/update/delete sirf Admin (Sir)."""

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role == User.Role.ADMIN
