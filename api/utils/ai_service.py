import openai
from typing import Dict, List
import json
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        openai.api_key = settings.OPENAI_API_KEY

    def parse_resume(self, text: str) -> Dict:
        """
        Parse resume text using OpenAI to extract structured information
        """
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that extracts structured information from resumes."
                    },
                    {
                        "role": "user",
                        "content": f"Please extract the following information from this resume and return it as JSON: skills, experience, education, and key achievements. Here's the resume:\n\n{text}"
                    }
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            # Extract the JSON from the response
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            logger.error(f"Error parsing resume with OpenAI: {str(e)}")
            return {}

    def calculate_job_match(self, resume_data: Dict, job_data: Dict) -> Dict:
        """
        Calculate the match score between a resume and a job posting
        """
        try:
            # Prepare the comparison data
            comparison_text = f"""
            Resume Skills: {', '.join(resume_data.get('skills', []))}
            Resume Experience: {json.dumps(resume_data.get('experience', []))}
            
            Job Title: {job_data['title']}
            Job Requirements: {job_data['requirements']}
            Required Skills: {', '.join(job_data.get('required_skills', []))}
            """

            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an AI recruiter that analyzes the match between candidates and job postings."
                    },
                    {
                        "role": "user",
                        "content": f"Analyze the match between this resume and job posting. Provide a match score (0-100) and detailed analysis. Return as JSON with 'score' and 'analysis' fields.\n\n{comparison_text}"
                    }
                ],
                temperature=0.3,
                max_tokens=1000
            )

            return json.loads(response.choices[0].message.content)
        except Exception as e:
            logger.error(f"Error calculating job match with OpenAI: {str(e)}")
            return {'score': 0, 'analysis': str(e)}

    def generate_cover_letter(self, resume_data: Dict, job_data: Dict) -> str:
        """
        Generate a customized cover letter based on resume and job posting
        """
        try:
            prompt = f"""
            Resume Information:
            Skills: {', '.join(resume_data.get('skills', []))}
            Experience: {json.dumps(resume_data.get('experience', []))}
            
            Job Information:
            Title: {job_data['title']}
            Company: {job_data['company']}
            Requirements: {job_data['requirements']}
            
            Generate a professional cover letter that highlights the relevant skills and experience.
            """

            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert at writing compelling cover letters."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=1000
            )

            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error generating cover letter with OpenAI: {str(e)}")
            return ""
