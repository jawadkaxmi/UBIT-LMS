from django.db import models


class Teacher(models.Model):
    """
    Ek teacher — jo classes/courses parhata hai.

    NOTE: Ye User (login accounts) se ALAG hai. Teacher ka LMS account
    hona zaroori nahi; ye bas ek list hai jise admin manage karta hai
    aur class banate waqt dropdown se select karta hai.

    Delete "soft" hota hai — teacher hataने par record delete nahi hota,
    bas is_active = False ho jata hai (taaki purani classes mein naam safe rahe).
    """

    name = models.CharField(
        max_length=150,
        help_text='Full name of the teacher, e.g. "Dr. Ahmed"',
    )
    email = models.EmailField(
        blank=True,
        help_text='Email (optional)',
    )
    designation = models.CharField(
        max_length=100,
        blank=True,
        help_text='Post, e.g. "Lecturer" / "Professor" (optional)',
    )

    # --- Soft delete ke fields ---
    is_active = models.BooleanField(
        default=True,
        help_text='Is the teacher active? (False = removed, but record kept)',
    )
    removal_reason = models.CharField(
        max_length=255,
        blank=True,
        help_text='If removed, the reason (e.g. "Left the institute")',
    )
    removed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When the teacher was removed (soft delete time)',
    )

    # Kab add hua (automatic)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Naam ke hisaab se sorted
        ordering = ['name']

    def __str__(self):
        status = 'active' if self.is_active else 'inactive'
        return f'{self.name} ({status})'
