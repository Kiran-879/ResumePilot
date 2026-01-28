# jobs/urls.py
from django.urls import path
from .views import (
    JobDescriptionListCreateView,
    JobDescriptionDetailView,
    job_stats,
    job_matched_candidates,
    export_job_candidates_excel,
    get_all_applied_resumes
)

urlpatterns = [
    path('', JobDescriptionListCreateView.as_view(), name='job-list-create'),
    path('<int:pk>/', JobDescriptionDetailView.as_view(), name='job-detail'),
    path('<int:pk>/candidates/', job_matched_candidates, name='job-matched-candidates'),
    path('<int:pk>/export/', export_job_candidates_excel, name='job-export-excel'),
    path('<int:pk>/applied/', get_all_applied_resumes, name='job-applied-resumes'),
    path('stats/', job_stats, name='job-stats'),
]