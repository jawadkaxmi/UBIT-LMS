from rest_framework import permissions
from accounts.models import User


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Security rule:
    - Read (GET) — koi bhi logged-in user (Admin/Student/Visitor) dekh sakta hai
    - Write (POST/PUT/DELETE) — SIRF Admin (Sir) kar sakta hai

    Isse student/visitor API se bhi announcement nahi bana/delete kar sakte.
    """

    def has_permission(self, request, view):
        # Pehle: user logged-in hona chahiye
        if not (request.user and request.user.is_authenticated):
            return False

        # Read requests — sabke liye allowed
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write requests — sirf Admin role
        return request.user.role == User.Role.ADMIN
