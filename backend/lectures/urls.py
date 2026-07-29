from django.urls import path
from .views import LectureListView, ClassLectureView

urlpatterns = [
    # Saari lectures (panel ke liye)
    path('lectures/', LectureListView.as_view(), name='lecture-list'),
    # Ek class ki recording (add/get/delete)
    path('classes/<int:class_id>/lecture/', ClassLectureView.as_view(), name='class-lecture'),
]
