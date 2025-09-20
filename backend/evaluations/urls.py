# evaluations/urls.py
from django.urls import path
from .views import (
    EvaluationListCreateView,
    EvaluationDetailView,
    evaluation_stats
)

urlpatterns = [
    path('', EvaluationListCreateView.as_view(), name='evaluation-list-create'),
    path('<int:pk>/', EvaluationDetailView.as_view(), name='evaluation-detail'),
    path('stats/', evaluation_stats, name='evaluation-stats'),
]