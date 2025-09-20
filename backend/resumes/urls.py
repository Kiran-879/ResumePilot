# resumes/urls.py
from django.urls import path
from .views import (
    ResumeListCreateView,
    ResumeDetailView,
    ResumeDownloadView,
    resume_stats
)

urlpatterns = [
    path('', ResumeListCreateView.as_view(), name='resume-list-create'),
    path('<int:pk>/', ResumeDetailView.as_view(), name='resume-detail'),
    path('<int:pk>/download/', ResumeDownloadView.as_view(), name='resume-download'),
    path('stats/', resume_stats, name='resume-stats'),
]