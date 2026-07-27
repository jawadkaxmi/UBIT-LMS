from rest_framework import serializers

from attendance.models import AttendanceRecord
from .models import ClassSession


class ClassSessionSerializer(serializers.ModelSerializer):
    """ClassSession ko JSON mein badalne ke liye (API ke liye)."""

    # Teacher ka naam bhi bhejte hain (frontend mein dikhane ke liye, read-only)
    teacher_name = serializers.SerializerMethodField()
    # Current user abhi is class mein hai ya nahi (Join/Leave button ke liye)
    is_joined = serializers.SerializerMethodField()
    # Attendance ka khulasa (Attendance page ki list ke liye)
    attendance_present_count = serializers.SerializerMethodField()
    attendance_total_count = serializers.SerializerMethodField()

    class Meta:
        model = ClassSession
        fields = (
            'id', 'title', 'description', 'date', 'start_time',
            'meet_link', 'teacher', 'teacher_name',
            'started_at', 'ended_at',
            'attendance_taken_at', 'attendance_published', 'is_joined',
            'attendance_present_count', 'attendance_total_count',
            'created_at',
        )
        # Ye fields user set nahi kar sakta — system/actions set karte hain
        read_only_fields = (
            'created_at', 'started_at', 'ended_at',
            'attendance_taken_at', 'attendance_published',
        )

    def get_teacher_name(self, obj):
        # Agar teacher assign hai to naam, warna None
        return obj.teacher.name if obj.teacher else None

    def get_is_joined(self, obj):
        # Koi khula PresenceLog hai? (left_at khaali = abhi andar hai)
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.presence_logs.filter(student=request.user, left_at__isnull=True).exists()

    def get_attendance_present_count(self, obj):
        # Kitne students Present mark hue
        return obj.attendance_records.filter(status=AttendanceRecord.Status.PRESENT).count()

    def get_attendance_total_count(self, obj):
        # Kul kitne students ki attendance sheet mein rows hain
        return obj.attendance_records.count()
