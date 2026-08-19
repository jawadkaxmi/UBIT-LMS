from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from announcements.models import Announcement
from attendance.models import AttendanceRecord
from classes.models import ClassSession
from lectures.models import Lecture
from teachers.models import Teacher


def _pct(part, whole):
    """Safe percentage — 0 se divide na ho."""
    return round(part / whole * 100) if whole else 0


def _class_brief(cs):
    """Ek class ka chhota summary (Next/Live class card ke liye)."""
    if cs is None:
        return None
    return {
        'id': cs.id,
        'course_name': cs.course_name,
        'title': cs.title,
        'date': cs.date,
        'start_time': cs.start_time,
        'meet_link': cs.meet_link,
        'is_live': cs.started_at is not None and cs.ended_at is None,
    }


def _next_class():
    """Abhi jo live class hai, warna aane wali agli class (jo khatam nahi hui)."""
    live = (
        ClassSession.objects
        .filter(started_at__isnull=False, ended_at__isnull=True)
        .order_by('date', 'start_time')
        .first()
    )
    if live:
        return live
    today = timezone.localdate()
    return (
        ClassSession.objects
        .filter(ended_at__isnull=True, date__gte=today)
        .order_by('date', 'start_time')
        .first()
    )


def _latest_announcements(limit=3):
    # Announcement model already ordered hai: pinned pehle, phir naye
    return [
        {
            'id': a.id,
            'title': a.title,
            'is_pinned': a.is_pinned,
            'created_at': a.created_at,
        }
        for a in Announcement.objects.all()[:limit]
    ]


class DashboardView(APIView):
    """
    Role ke hisaab se dashboard ka data (tiles + charts ke liye).

    GET /api/dashboard/
      - Admin  -> counts + attendance stats + next class + announcements
      - Student-> apni attendance + next class + announcements
      - Visitor-> sirf role (koi stats nahi)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == User.Role.ADMIN:
            return Response(self._admin_data())
        if user.role == User.Role.STUDENT:
            return Response(self._student_data(user))
        return Response({'role': 'VISITOR'})

    # ---------- Admin (Sir) ----------
    def _admin_data(self):
        # Stat tiles
        stats = {
            'students': User.objects.filter(role=User.Role.STUDENT).count(),
            'classes': ClassSession.objects.count(),
            'lectures': Lecture.objects.count(),
            'teachers': Teacher.objects.filter(is_active=True).count(),
        }

        # Overall attendance (saari records ka present %)
        all_records = AttendanceRecord.objects.all()
        total = all_records.count()
        present = all_records.filter(status=AttendanceRecord.Status.PRESENT).count()
        attendance_overall = {
            'present': present,
            'total': total,
            'percent': _pct(present, total),
        }

        # Aakhri 6 classes jinki attendance li gayi — har ek ka present %
        recent_classes = (
            ClassSession.objects
            .filter(attendance_taken_at__isnull=False)
            .order_by('-date', '-start_time')[:6]
        )
        attendance_recent = []
        # reversed: purani -> nayi (bar chart left se right)
        for cs in reversed(list(recent_classes)):
            recs = AttendanceRecord.objects.filter(class_session=cs)
            t = recs.count()
            p = recs.filter(status=AttendanceRecord.Status.PRESENT).count()
            attendance_recent.append({
                'title': cs.title,
                'date': cs.date,
                'present': p,
                'total': t,
                'percent': _pct(p, t),
            })

        return {
            'role': 'ADMIN',
            'stats': stats,
            'attendance_overall': attendance_overall,
            'attendance_recent': attendance_recent,
            'next_class': _class_brief(_next_class()),
            'announcements': _latest_announcements(),
        }

    # ---------- Student ----------
    def _student_data(self, user):
        # Sirf PUBLISHED sheets student ke liye count hoti hain
        my_records = (
            AttendanceRecord.objects
            .filter(student=user, class_session__attendance_published=True)
            .select_related('class_session')
        )
        total = my_records.count()
        attended = my_records.filter(status=AttendanceRecord.Status.PRESENT).count()

        stats = {
            'attendance_percent': _pct(attended, total),
            'classes_attended': attended,
            'classes_total': total,
            'lectures': Lecture.objects.count(),
        }

        # Aakhri 8 classes ka status (dots ke liye), purani -> nayi
        recent = my_records.order_by('-class_session__date')[:8]
        attendance_recent = [
            {
                'title': r.class_session.title,
                'date': r.class_session.date,
                'status': r.status,
            }
            for r in reversed(list(recent))
        ]

        return {
            'role': 'STUDENT',
            'stats': stats,
            'attendance_recent': attendance_recent,
            'next_class': _class_brief(_next_class()),
            'announcements': _latest_announcements(),
        }
