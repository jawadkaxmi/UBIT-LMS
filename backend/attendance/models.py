from django.conf import settings
from django.db import models
from django.utils import timezone


class PresenceLog(models.Model):
    """
    Ek student ka ek "join -> leave" ka record.

    Student baar-baar join/leave kar sakta hai (network issue, washroom, etc.),
    isliye ek class ke liye ek student ke KAI logs ban sakte hain.
    `left_at` khaali (null) ka matlab: student abhi class mein maujood hai.
    """

    class_session = models.ForeignKey(
        'classes.ClassSession',
        on_delete=models.CASCADE,
        related_name='presence_logs',
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='presence_logs',
    )
    joined_at = models.DateTimeField(
        default=timezone.now,
        help_text='When the student joined the class',
    )
    left_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When the student left (empty means still in the class)',
    )

    class Meta:
        ordering = ['joined_at']

    def __str__(self):
        return f'{self.student.username} — {self.class_session.title} ({self.joined_at})'


class AttendanceRecord(models.Model):
    """
    Ek class ke liye ek student ki FINAL attendance (sheet ki ek row).

    Ye tab banti/update hoti hai jab Sir "Take Attendance" dabata hai.
    Rule: us waqt jo student class mein maujood tha (open PresenceLog),
    wo Present; baaki Absent. Sir baad mein manually badal sakta hai.
    """

    class Status(models.TextChoices):
        PRESENT = 'PRESENT', 'Present'
        ABSENT = 'ABSENT', 'Absent'

    class_session = models.ForeignKey(
        'classes.ClassSession',
        on_delete=models.CASCADE,
        related_name='attendance_records',
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='attendance_records',
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.ABSENT,
    )

    # --- Details (sheet mein sabko dikhengi) ---
    join_count = models.PositiveIntegerField(
        default=0,
        help_text='How many times the student joined the class',
    )
    total_minutes = models.PositiveIntegerField(
        default=0,
        help_text='Total minutes the student spent in the class',
    )
    first_joined_at = models.DateTimeField(null=True, blank=True)
    last_joined_at = models.DateTimeField(null=True, blank=True)
    was_present_at_attendance = models.BooleanField(
        default=False,
        help_text='Was the student in the class at the moment attendance was taken?',
    )
    manually_edited = models.BooleanField(
        default=False,
        help_text='Was this record changed manually by the admin?',
    )

    class Meta:
        # Ek student ki ek class ke liye sirf EK attendance row
        unique_together = ('class_session', 'student')
        ordering = ['student__username']

    def __str__(self):
        return f'{self.student.username} — {self.class_session.title}: {self.get_status_display()}'
