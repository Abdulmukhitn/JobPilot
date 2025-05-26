from django.db import models
from django.contrib.auth.models import User

class Resume(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resumes')
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='resumes/')
    parsed_content = models.JSONField(null=True, blank=True)
    skills = models.JSONField(null=True, blank=True)
    experience = models.JSONField(null=True, blank=True)
    education = models.JSONField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s resume - {self.title}"

class Job(models.Model):
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    description = models.TextField()
    requirements = models.TextField()
    salary_range = models.CharField(max_length=100)
    job_type = models.CharField(max_length=50)
    posted_date = models.DateTimeField(auto_now_add=True)
    deadline = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    source = models.CharField(max_length=50, default='manual')  # 'manual', 'hh', etc.
    external_id = models.CharField(max_length=100, null=True, blank=True)
    raw_data = models.JSONField(null=True, blank=True)  # Store complete API response
    required_skills = models.JSONField(null=True, blank=True)
    parsed_requirements = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} at {self.company}"

class Application(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('reviewing', 'Reviewing'),
        ('interviewed', 'Interviewed'),
        ('offered', 'Offered'),
        ('rejected', 'Rejected'),
        ('accepted', 'Accepted'),
    ]

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    resume = models.ForeignKey(Resume, on_delete=models.SET_NULL, null=True, related_name='applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    cover_letter = models.TextField(null=True, blank=True)
    applied_date = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    notes = models.TextField(null=True, blank=True)
    match_score = models.FloatField(null=True, blank=True)  # AI-generated match score
    match_details = models.JSONField(null=True, blank=True)  # Detailed matching analysis

    class Meta:
        unique_together = ('job', 'user')

    def __str__(self):
        return f"{self.user.username}'s application for {self.job.title}"

class JobSkillMatch(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='skill_matches')
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='skill_matches')
    match_score = models.FloatField()
    match_details = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('job', 'resume')
        indexes = [
            models.Index(fields=['match_score']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"Match: {self.resume.user.username}'s resume - {self.job.title} ({self.match_score}%)"
