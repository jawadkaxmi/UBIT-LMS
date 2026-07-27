from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.models import User
from attendance.models import PresenceLog, AttendanceRecord
from attendance.serializers import AttendanceRecordSerializer
from attendance.services import take_attendance as run_take_attendance

from .models import ClassSession
from .serializers import ClassSessionSerializer
from .permissions import IsAdminOrReadOnly


class ClassSessionViewSet(viewsets.ModelViewSet):
    """
    Classes ka poora API — ek hi jagah se:
      GET    /api/classes/       -> saari classes ki list
      POST   /api/classes/       -> nayi class (sirf Admin)
      GET    /api/classes/<id>/  -> ek class ki detail
      PUT    /api/classes/<id>/  -> edit (sirf Admin)
      DELETE /api/classes/<id>/  -> delete (sirf Admin)

    Attendance ke extra actions (neeche):
      POST /api/classes/<id>/join/                -> student join
      POST /api/classes/<id>/leave/               -> student leave
      POST /api/classes/<id>/take_attendance/     -> Admin: sheet calculate
      POST /api/classes/<id>/publish_attendance/  -> Admin: sheet publish
      GET  /api/classes/<id>/attendance/          -> sheet dekhna

    Security IsAdminOrReadOnly se aati hai (upar permissions.py).
    """
    queryset = ClassSession.objects.all()
    serializer_class = ClassSessionSerializer
    permission_classes = [IsAdminOrReadOnly]

    # ---------- Student: join / leave ----------

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def join(self, request, pk=None):
        """
        Student ne class join ki -> naya PresenceLog bane.
        Agar pehle se koi khula log hai (already andar hai) to naya nahi banta.
        """
        class_session = self.get_object()
        user = request.user

        # Visitor enrolled nahi hai — join nahi kar sakta
        if user.role == User.Role.VISITOR:
            raise PermissionDenied('Visitors cannot join classes.')

        # Class shuru hone se pehle / khatam hone ke baad join nahi
        if class_session.started_at is None:
            raise ValidationError('The class has not started yet.')
        if class_session.ended_at is not None:
            raise ValidationError('The class has already ended.')

        open_log = PresenceLog.objects.filter(
            class_session=class_session, student=user, left_at__isnull=True
        ).first()
        if open_log is None:
            open_log = PresenceLog.objects.create(class_session=class_session, student=user)

        return Response({'is_joined': True, 'joined_at': open_log.joined_at})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def leave(self, request, pk=None):
        """Student ne class chhodi -> khule log par left_at set ho."""
        class_session = self.get_object()

        open_log = PresenceLog.objects.filter(
            class_session=class_session, student=request.user, left_at__isnull=True
        ).first()
        if open_log is None:
            return Response({'is_joined': False, 'detail': 'You are not currently in this class.'})

        open_log.left_at = timezone.now()
        open_log.save(update_fields=['left_at'])
        return Response({'is_joined': False, 'left_at': open_log.left_at})

    # ---------- Admin: class start / end ----------

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Sir ne class start ki -> start time record ho (sirf pehli baar)."""
        class_session = self.get_object()
        if class_session.started_at is None:
            class_session.started_at = timezone.now()
            class_session.save(update_fields=['started_at'])
        return Response({'started_at': class_session.started_at})

    @action(detail=True, methods=['post'])
    def end(self, request, pk=None):
        """
        Sir ne class end ki. Teen kaam is TARTEEB mein:
          1) Agar attendance abhi tak nahi li -> pehle le lo (us lamhe ka
             snapshot). Ye DRAFT rehti hai — Sir khud publish karega.
          2) Jitne students abhi "andar" hain, unke logs band karo
             (taaki koi hamesha "In class" na rahe).
          3) End time record karo.

        Tarteeb ahem hai: attendance PEHLE, warna sab Absent ho jayenge.
        """
        class_session = self.get_object()

        if class_session.started_at is None:
            raise ValidationError('The class has not started yet.')
        if class_session.ended_at is not None:
            raise ValidationError('The class has already ended.')

        now = timezone.now()

        # 1) Attendance ka snapshot (agar pehle nahi li gayi) — draft rahegi
        if class_session.attendance_taken_at is None:
            run_take_attendance(class_session)

        # 2) Khule logs band karo
        PresenceLog.objects.filter(
            class_session=class_session, left_at__isnull=True
        ).update(left_at=now)

        # 3) End time
        class_session.ended_at = now
        class_session.save(update_fields=['ended_at'])

        return Response({'ended_at': class_session.ended_at})

    # ---------- Admin: take attendance / publish ----------

    @action(detail=True, methods=['post'], url_path='take_attendance')
    def take_attendance(self, request, pk=None):
        """
        Sir ne "Take Attendance" dabaya -> sheet calculate ho.
        Us waqt jo students class mein maujood hain, wo Present.
        """
        class_session = self.get_object()

        # Class shuru huye bina attendance nahi
        if class_session.started_at is None:
            raise ValidationError('Start the class before taking attendance.')
        # Class khatam hone ke baad re-take nahi (sab logs band hain ->
        # sab Absent ho jayenge). Manual edit phir bhi ho sakti hai.
        if class_session.ended_at is not None:
            raise ValidationError('The class has ended; attendance can no longer be re-taken.')

        run_take_attendance(class_session)
        records = AttendanceRecord.objects.filter(class_session=class_session)
        return Response(AttendanceRecordSerializer(records, many=True).data)

    @action(detail=True, methods=['post'], url_path='publish_attendance')
    def publish_attendance(self, request, pk=None):
        """
        Sheet publish/unpublish. Body: {"publish": true} (default true).
        Publish hone ke baad hi students ko sheet dikhti hai.
        """
        class_session = self.get_object()
        class_session.attendance_published = bool(request.data.get('publish', True))
        class_session.save(update_fields=['attendance_published'])
        return Response({'attendance_published': class_session.attendance_published})

    # ---------- Sheet dekhna ----------

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def attendance(self, request, pk=None):
        """
        Attendance sheet. Admin hamesha dekh sakta hai;
        baaki sabko sirf publish hone ke baad dikhti hai.
        """
        class_session = self.get_object()

        if request.user.role != User.Role.ADMIN and not class_session.attendance_published:
            raise PermissionDenied('Attendance has not been published yet.')

        records = AttendanceRecord.objects.filter(class_session=class_session)
        return Response(AttendanceRecordSerializer(records, many=True).data)
