from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),
    # Job endpoints
    path('jobs/', views.JobListView.as_view(), name='job-list'),
    path('jobs/<int:pk>/', views.JobDetailView.as_view(), name='job-detail'),
    path('jobs/search/', views.JobSearchView.as_view(), name='job-search'),
    
    # Application endpoints
    path('applications/', views.ApplicationListView.as_view(), name='application-list'),
    path('applications/<int:pk>/', views.ApplicationDetailView.as_view(), name='application-detail'),
    
    # Profile endpoints
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('profile/resume/', views.ResumeUploadView.as_view(), name='resume-upload'),
    
    # Authentication endpoints (ADD THESE)
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/user/', views.UserProfileView.as_view(), name='user-profile'),
]
