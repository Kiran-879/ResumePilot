# evaluations/urls.py
from django.urls import path
from .views import (
    EvaluationListCreateView,
    EvaluationDetailView,
    evaluation_stats,
    my_applications,
    apply_to_job,
    check_application_status,
    update_application_status
)

urlpatterns = [
    path('', EvaluationListCreateView.as_view(), name='evaluation-list-create'),
    path('<int:pk>/', EvaluationDetailView.as_view(), name='evaluation-detail'),
    path('stats/', evaluation_stats, name='evaluation-stats'),
    # Job Applications
    path('applications/', my_applications, name='my-applications'),
    path('applications/apply/', apply_to_job, name='apply-to-job'),
    path('applications/check/<int:job_id>/', check_application_status, name='check-application'),
    path('applications/<int:application_id>/update/', update_application_status, name='update-application'),
]