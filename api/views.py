from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .models import Resume, Job, Application, JobSkillMatch
from .serializers import (
    UserSerializer, ResumeSerializer, JobSerializer,
    ApplicationSerializer, JobSkillMatchSerializer
)
from .utils.resume_parser import ResumeParser
from .utils.ai_service import AIService
from .utils.hh_api import HHApi, sync_vacancies
from django.conf import settings
from social_django.utils import load_strategy, load_backend
from social_core.exceptions import MissingBackend, AuthTokenError, AuthForbidden
import requests
import io
import logging

logger = logging.getLogger(__name__)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]  # Allow anyone to register

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            "user": UserSerializer(user).data,
            "message": "User created successfully"
        }, status=status.HTTP_201_CREATED)

    def get_queryset(self):
        if self.request.user.is_superuser:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

class ResumeViewSet(viewsets.ModelViewSet):
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        resume = serializer.save(user=self.request.user)
        self._process_resume(resume)

    @action(detail=True, methods=['post'])
    def reanalyze(self, request, pk=None):
        resume = self.get_object()
        self._process_resume(resume)
        return Response(ResumeSerializer(resume).data)

    def _process_resume(self, resume):
        try:
            # Parse resume file
            file_obj = resume.file.file
            content = ResumeParser.extract_text(io.BytesIO(file_obj.read()), file_obj.content_type)
            
            if content:
                # Use AI to extract information
                ai_service = AIService()
                parsed_data = ai_service.parse_resume(content)
                
                # Update resume with parsed data
                resume.parsed_content = content
                resume.skills = parsed_data.get('skills', [])
                resume.experience = parsed_data.get('experience', [])
                resume.education = parsed_data.get('education', [])
                resume.save()

        except Exception as e:
            logger.error(f"Error processing resume {resume.id}: {str(e)}")

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def sync_hh(self, request):
        try:
            sync_vacancies()
            return Response({"message": "Jobs synchronized successfully"})
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def match_resume(self, request, pk=None):
        job = self.get_object()
        resume_id = request.data.get('resume_id')
        
        try:
            resume = Resume.objects.get(id=resume_id, user=request.user)
            ai_service = AIService()
            
            # Calculate match score
            match_result = ai_service.calculate_job_match(
                {
                    'skills': resume.skills,
                    'experience': resume.experience
                },
                {
                    'title': job.title,
                    'requirements': job.requirements,
                    'required_skills': job.required_skills
                }
            )
            
            # Create or update job match
            match, _ = JobSkillMatch.objects.update_or_create(
                job=job,
                resume=resume,
                defaults={
                    'match_score': match_result['score'],
                    'match_details': match_result['analysis']
                }
            )
            
            return Response(JobSkillMatchSerializer(match).data)
            
        except Resume.DoesNotExist:
            return Response(
                {"error": "Resume not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Application.objects.all()
        return Application.objects.filter(user=user)

    def perform_create(self, serializer):
        job_id = self.request.data.get('job_id')
        resume_id = self.request.data.get('resume_id')
        
        try:
            job = Job.objects.get(id=job_id)
            resume = Resume.objects.get(id=resume_id, user=self.request.user)
            
            # Generate cover letter if not provided
            cover_letter = self.request.data.get('cover_letter')
            if not cover_letter:
                ai_service = AIService()
                cover_letter = ai_service.generate_cover_letter(
                    {
                        'skills': resume.skills,
                        'experience': resume.experience
                    },
                    {
                        'title': job.title,
                        'company': job.company,
                        'requirements': job.requirements
                    }
                )
            
            # Create application
            serializer.save(
                user=self.request.user,
                job=job,
                resume=resume,
                cover_letter=cover_letter
            )
            
        except (Job.DoesNotExist, Resume.DoesNotExist) as e:
            raise serializers.ValidationError(str(e))

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        application = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Application.STATUS_CHOICES):
            return Response(
                {"error": "Invalid status"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        application.status = new_status
        application.save()
        return Response(ApplicationSerializer(application).data)

class JobSkillMatchViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = JobSkillMatch.objects.all()
    serializer_class = JobSkillMatchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return JobSkillMatch.objects.all()
        return JobSkillMatch.objects.filter(resume__user=user)

@api_view(['POST'])
@permission_classes([AllowAny])
def exchange_token(request):
    """
    Exchange OAuth token for JWT tokens
    """
    provider = request.data.get('provider')
    access_token = request.data.get('access_token')
    
    if provider == 'google':
        response = requests.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        if response.status_code != 200:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
        
        user_data = response.json()
        email = user_data.get('email')
        if not email:
            return Response({'error': 'Email not provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email,
                'first_name': user_data.get('given_name', ''),
                'last_name': user_data.get('family_name', '')
            }
        )
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })
        
    elif provider == 'github':
        response = requests.get(
            'https://api.github.com/user',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        if response.status_code != 200:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
        
        user_data = response.json()
        username = user_data.get('login')
        email = user_data.get('email')
        
        if not email:
            # Get email from GitHub email endpoint if not provided in user data
            email_response = requests.get(
                'https://api.github.com/user/emails',
                headers={'Authorization': f'Bearer {access_token}'}
            )
            if email_response.status_code == 200:
                emails = email_response.json()
                primary_email = next((e['email'] for e in emails if e['primary']), None)
                email = primary_email or emails[0]['email'] if emails else None
        
        if not email:
            return Response({'error': 'Email not provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': username or email,
                'first_name': user_data.get('name', '').split()[0] if user_data.get('name') else '',
                'last_name': ' '.join(user_data.get('name', '').split()[1:]) if user_data.get('name') else ''
            }
        )
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })
        
    return Response({'error': 'Provider not supported'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def exchange_token(request):
    """
    Exchange social auth token for JWT tokens
    """
    provider = request.data.get('provider')
    access_token = request.data.get('access_token')
    
    strategy = load_strategy(request)
    try:
        backend = load_backend(strategy=strategy, name=provider, redirect_uri=None)
    except MissingBackend:
        return Response({'error': 'Provider not found'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = backend.do_auth(access_token)
    except (AuthTokenError, AuthForbidden) as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })
    return Response({'error': 'Authentication failed'}, status=status.HTTP_400_BAD_REQUEST)
