from rest_framework import serializers
from .models import Lecture


class LectureSerializer(serializers.ModelSerializer):
    """Lecture ko JSON mein badalne ke liye."""

    # Class ki details bhi (Lectures panel mein dikhane ke liye)
    course_name = serializers.CharField(source='class_session.course_name', read_only=True)
    class_title = serializers.CharField(source='class_session.title', read_only=True)
    class_date = serializers.DateField(source='class_session.date', read_only=True)
    class_start_time = serializers.TimeField(source='class_session.start_time', read_only=True)
    # Instructor — class ke teacher se automatic (koi teacher na ho to None)
    teacher_name = serializers.SerializerMethodField()
    # Agar title khaali ho to class ka title dikhao
    display_title = serializers.SerializerMethodField()

    class Meta:
        model = Lecture
        fields = (
            'id', 'class_session', 'title', 'display_title',
            'youtube_url', 'chapters', 'created_at',
            'course_name', 'class_title', 'class_date', 'class_start_time', 'teacher_name',
        )
        read_only_fields = ('class_session', 'created_at')

    def get_display_title(self, obj):
        # Lecture ka apna title na ho to Class title le lo
        # (Course name alag se dikhta hai — class se automatic)
        return obj.title or obj.class_session.title

    def get_teacher_name(self, obj):
        teacher = obj.class_session.teacher
        return teacher.name if teacher else None

    def validate_chapters(self, value):
        """Chapters sahi shakl mein hon: list of {title: str, time: number>=0}."""
        if not isinstance(value, list):
            raise serializers.ValidationError('Chapters must be a list.')
        for ch in value:
            if not isinstance(ch, dict) or 'title' not in ch or 'time' not in ch:
                raise serializers.ValidationError(
                    'Each chapter needs a "title" and a "time".'
                )
            if not isinstance(ch['time'], (int, float)) or ch['time'] < 0:
                raise serializers.ValidationError('Chapter "time" must be a number of seconds.')
        return value
