import requests
from typing import Dict, List, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class HHApi:
    BASE_URL = "https://api.hh.ru/v1"
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'JobPilot/1.0 (educational project)',
            'Accept': 'application/json'
        })

    def search_vacancies(
        self,
        text: Optional[str] = None,
        area: Optional[str] = None,
        experience: Optional[str] = None,
        schedule: Optional[str] = None,
        per_page: int = 100
    ) -> Dict:
        """
        Search for vacancies on HH.ru
        """
        try:
            params = {
                'text': text,
                'area': area,
                'experience': experience,
                'schedule': schedule,
                'per_page': per_page
            }
            # Remove None values
            params = {k: v for k, v in params.items() if v is not None}
            
            response = self.session.get(f"{self.BASE_URL}/vacancies", params=params)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Error fetching vacancies from HH.ru: {str(e)}")
            return {'items': [], 'error': str(e)}

    def get_vacancy_details(self, vacancy_id: str) -> Dict:
        """
        Get detailed information about a specific vacancy
        """
        try:
            response = self.session.get(f"{self.BASE_URL}/vacancies/{vacancy_id}")
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Error fetching vacancy details from HH.ru: {str(e)}")
            return {'error': str(e)}

    def get_suggested_skills(self, text: str) -> List[str]:
        """
        Get suggested skills based on vacancy description
        """
        try:
            response = self.session.get(f"{self.BASE_URL}/suggests/skill_set", 
                                      params={'text': text})
            response.raise_for_status()
            return [item['text'] for item in response.json()['items']]
        except requests.RequestException as e:
            logger.error(f"Error fetching suggested skills from HH.ru: {str(e)}")
            return []

def sync_vacancies():
    """
    Sync vacancies from HH.ru to our database
    """
    from ..models import Job
    
    api = HHApi()
    results = api.search_vacancies()
    
    for vacancy in results.get('items', []):
        # Get full vacancy details
        details = api.get_vacancy_details(vacancy['id'])
        if 'error' in details:
            continue
            
        # Create or update job in our database
        job, created = Job.objects.update_or_create(
            external_id=vacancy['id'],
            source='hh',
            defaults={
                'title': vacancy['name'],
                'company': vacancy['employer']['name'],
                'location': vacancy['area']['name'],
                'description': details.get('description', ''),
                'requirements': details.get('requirement', ''),
                'salary_range': f"{vacancy.get('salary', {}).get('from', '')} - {vacancy.get('salary', {}).get('to', '')} {vacancy.get('salary', {}).get('currency', '')}",
                'job_type': vacancy['employment']['name'],
                'is_active': True,
                'raw_data': details,
                'required_skills': api.get_suggested_skills(vacancy['name'])
            }
        )
