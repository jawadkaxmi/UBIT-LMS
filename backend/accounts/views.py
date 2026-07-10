from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer


class MeView(APIView):
    """
    GET /api/me/
    Logged-in user ki apni details lauta_ta hai (username + role).
    React isse decide karega ki kaunsa dashboard dikhana hai
    (Admin / Student / Visitor).

    Sirf logged-in (authenticated) user hi ise access kar sakta hai.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
