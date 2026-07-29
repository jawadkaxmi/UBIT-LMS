from rest_framework import serializers
from .models import PresenceLog, AttendanceRecord


class PresenceLogSerializer(serializers.ModelSerializer):
    """Ek join/leave record → JSON."""

    student_name = serializers.CharField(source='student.username', read_only=True)

    class Meta:
        model = PresenceLog
        fields = ('id', 'class_session', 'student', 'student_name', 'joined_at', 'left_at')


class AttendanceRecordSerializer(serializers.ModelSerializer):
    """Attendance sheet ki ek row → JSON."""

    student_name = serializers.CharField(source='student.username', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    # Class ki details bhi (student ke apne attendance panel ke liye)
    course_name = serializers.CharField(source='class_session.course_name', read_only=True)
    class_title = serializers.CharField(source='class_session.title', read_only=True)
    class_date = serializers.DateField(source='class_session.date', read_only=True)
    class_start_time = serializers.TimeField(source='class_session.start_time', read_only=True)
    class_attendance_taken_at = serializers.DateTimeField(
        source='class_session.attendance_taken_at', read_only=True
    )

    class Meta:
        model = AttendanceRecord
        fields = (
            'id', 'class_session', 'student', 'student_name',
            'status', 'status_display', 'join_count', 'total_minutes',
            'first_joined_at', 'last_joined_at',
            'was_present_at_attendance', 'manually_edited',
            'course_name', 'class_title', 'class_date', 'class_start_time',
            'class_attendance_taken_at',
        )
        # Sirf `status` manually badla ja sakta hai — baaki system calculate karta hai
        read_only_fields = (
            'class_session', 'student', 'join_count', 'total_minutes',
            'first_joined_at', 'last_joined_at', 'was_present_at_attendance',
            'manually_edited',
        )
