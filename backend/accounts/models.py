from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    LMS ka custom User model.

    Django ke built-in User (AbstractUser) ko extend karta hai —
    matlab username, password, email waghera pehle se milte hain,
    aur hum usmein ek naya field 'role' add kar rahe hain.
    """

    class Role(models.TextChoices):
        # (database value, display naam)
        ADMIN = 'ADMIN', 'Admin'          # Sir — poora control
        STUDENT = 'STUDENT', 'Student'    # enrolled students
        VISITOR = 'VISITOR', 'Visitor'    # jo enrolled nahi

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.VISITOR,   # naya user default mein Visitor hoga
        help_text='Is user ka role: Admin, Student, ya Visitor',
    )

    def __str__(self):
        # Admin panel/list mein user aise dikhega: "umer (Student)"
        return f'{self.username} ({self.get_role_display()})'
