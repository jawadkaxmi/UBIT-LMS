from django.db import models


class ClassSession(models.Model):
    """
    Ek announced class (session) — jab Sir class lega.
    Har class ka topic, date, time aur Google Meet link hota hai.
    """

    course_name = models.CharField(
        max_length=200,
        blank=True,
        default='',
        help_text='The course this class belongs to, e.g. "OOP" / "Data Structures"',
    )
    title = models.CharField(
        max_length=200,
        help_text='The class (session) topic, e.g. "OOP - Inheritance"',
    )
    description = models.TextField(
        blank=True,
        help_text='Extra detail (optional), e.g. which chapter will be covered',
    )
    date = models.DateField(help_text='The date of the class')
    start_time = models.TimeField(help_text='What time the class starts')
    meet_link = models.URLField(
        blank=True,
        help_text='Google Meet link',
    )

    # Kaunsa teacher ye class lega (sirf active teachers dropdown mein).
    # on_delete=SET_NULL: agar teacher kabhi hard-delete ho to class na toote.
    teacher = models.ForeignKey(
        'teachers.Teacher',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='classes',
        limit_choices_to={'is_active': True},
        help_text='The teacher taking this class (only active teachers are shown)',
    )

    # --- Class ka lifecycle (Sir kab shuru/khatam karta hai) ---
    started_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When the class was started',
    )
    ended_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When the class was ended',
    )

    # --- Attendance ---
    # Attendance kab li gayi (Sir ne "Take Attendance" kab dabaya)
    attendance_taken_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When attendance was taken for this class',
    )
    # Jab tak publish na ho, attendance sheet sirf admin ko dikhegi
    attendance_published = models.BooleanField(
        default=False,
        help_text='If checked, the attendance sheet is visible to everyone',
    )

    # Class kab banayi gayi (automatic, khud set hota hai)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Date + time ke hisaab se sorted
        ordering = ['date', 'start_time']

    def __str__(self):
        return f'{self.title} ({self.date} {self.start_time})'
