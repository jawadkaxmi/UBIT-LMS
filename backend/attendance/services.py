from django.utils import timezone

from accounts.models import User
from .models import PresenceLog, AttendanceRecord


def take_attendance(class_session):
    """
    "Take Attendance" ka dil.

    Har student ke join/leave logs se stats nikalta hai aur uski
    AttendanceRecord banata/update karta hai.

    RULE (jo tay hua tha):
      Jis student ka koi log "khula" hai (left_at khaali) — yani attendance
      lete waqt wo class mein MAUJOOD hai — wo PRESENT; baaki ABSENT.
      Chahe usne pehle kitni hi baar join/leave kiya ho.

    Jis row ko Sir ne pehle MANUALLY edit kiya ho, uska status nahi badalta
    (sirf details refresh hoti hain).
    """
    now = timezone.now()
    students = User.objects.filter(role=User.Role.STUDENT)

    for student in students:
        logs = PresenceLog.objects.filter(class_session=class_session, student=student)

        join_count = logs.count()
        total_seconds = 0
        first_joined_at = None
        last_joined_at = None
        is_present_now = False

        for log in logs:
            # Abhi tak nahi nikla to "ab tak" ka waqt gino
            end = log.left_at or now
            total_seconds += (end - log.joined_at).total_seconds()

            if first_joined_at is None or log.joined_at < first_joined_at:
                first_joined_at = log.joined_at
            if last_joined_at is None or log.joined_at > last_joined_at:
                last_joined_at = log.joined_at
            if log.left_at is None:
                is_present_now = True  # abhi class mein maujood hai

        record, _created = AttendanceRecord.objects.get_or_create(
            class_session=class_session,
            student=student,
        )

        # Details hamesha refresh hoti hain
        record.join_count = join_count
        record.total_minutes = int(total_seconds // 60)
        record.first_joined_at = first_joined_at
        record.last_joined_at = last_joined_at
        record.was_present_at_attendance = is_present_now

        # Status sirf tab set karo jab Sir ne manually na badla ho
        if not record.manually_edited:
            record.status = (
                AttendanceRecord.Status.PRESENT
                if is_present_now
                else AttendanceRecord.Status.ABSENT
            )

        record.save()

    # Class par nishaan laga do ki attendance kab li gayi
    class_session.attendance_taken_at = now
    class_session.save(update_fields=['attendance_taken_at'])
