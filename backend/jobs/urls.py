# jobs/urls.py
from django.urls import path
from .views import (
    JobDescriptionListCreateView,
    JobDescriptionDetailView,
    job_stats
)

urlpatterns = [
    path('', JobDescriptionListCreateView.as_view(), name='job-list-create'),
    path('<int:pk>/', JobDescriptionDetailView.as_view(), name='job-detail'),
    path('stats/', job_stats, name='job-stats'),
]