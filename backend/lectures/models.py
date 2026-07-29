from django.db import models


class Lecture(models.Model):
    """
    Ek class ki recorded lecture (YouTube video + chapters).

    Har class ki EK hi recording hoti hai (OneToOne). Chapters ek JSON list
    mein rakhe jaate hain, jaise:
      [
        {"title": "Introduction", "time": 0},
        {"title": "Example",      "time": 330},   # 330 sec = 5:30
        {"title": "Summary",      "time": 720},
      ]
    `time` seconds mein hota hai taaki video us waqt par jump kar sake.
    """

    class_session = models.OneToOneField(
        'classes.ClassSession',
        on_delete=models.CASCADE,
        related_name='lecture',
    )
    title = models.CharField(
        max_length=200,
        blank=True,
        help_text='Lecture title (optional — defaults to the class title)',
    )
    youtube_url = models.URLField(
        help_text='YouTube link (an unlisted video works well)',
    )
    chapters = models.JSONField(
        default=list,
        blank=True,
        help_text='List of chapters, e.g. [{"title": "Intro", "time": 0}]',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title or self.class_session.title
