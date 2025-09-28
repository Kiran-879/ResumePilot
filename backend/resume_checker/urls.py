# resume_checker/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_home(request):
    return JsonResponse({
        'message': 'ResumePilot API is running!',
        'status': 'success',
        'endpoints': {
            'auth': '/api/auth/',
            'jobs': '/api/jobs/',
            'resumes': '/api/resumes/',
            'evaluations': '/api/evaluations/',
            'admin': '/admin/'
        }
    })

urlpatterns = [
    path('', api_home, name='api_home'),  # Root URL
    path('api/', api_home, name='api_home_alt'),  # Alternative API root
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/jobs/', include('jobs.urls')),
    path('api/resumes/', include('resumes.urls')),
    path('api/evaluations/', include('evaluations.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)