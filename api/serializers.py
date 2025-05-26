from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Resume, Job, Application, JobSkillMatch

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')
        read_only_fields = ('id',)

class ResumeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Resume
        fields = '__all__'
        read_only_fields = ('user', 'parsed_content', 'skills', 'experience', 'education')

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ('required_skills', 'parsed_requirements', 'raw_data')

class ApplicationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    job = JobSerializer(read_only=True)
    resume = ResumeSerializer(read_only=True)
    
    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ('user', 'match_score', 'match_details')

class JobSkillMatchSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    resume = ResumeSerializer(read_only=True)
    
    class Meta:
        model = JobSkillMatch
        fields = '__all__'
        read_only_fields = ('match_score', 'match_details')
