from rest_framework import permissions
from accounts.models import User


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Security rule (wahi jo classes mein tha):
    - Read (GET) — koi bhi logged-in user dekh sakta hai
    - Write (POST/PUT/DELETE + deactivate) — SIRF Admin (Sir)
    """

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role == User.Role.ADMIN
