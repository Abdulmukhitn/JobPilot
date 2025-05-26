import PyPDF2
import docx
import io
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class ResumeParser:
    @staticmethod
    def extract_text(file_obj: io.BytesIO, file_type: str) -> Optional[str]:
        """
        Extract text content from various file types
        """
        try:
            if file_type == 'application/pdf':
                return ResumeParser._parse_pdf(file_obj)
            elif file_type in ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']:
                return ResumeParser._parse_docx(file_obj)
            elif file_type == 'text/plain':
                return file_obj.read().decode('utf-8')
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
        except Exception as e:
            logger.error(f"Error parsing resume file: {str(e)}")
            return None

    @staticmethod
    def _parse_pdf(file_obj: io.BytesIO) -> str:
        """
        Extract text from PDF files
        """
        try:
            pdf_reader = PyPDF2.PdfReader(file_obj)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            logger.error(f"Error parsing PDF: {str(e)}")
            raise

    @staticmethod
    def _parse_docx(file_obj: io.BytesIO) -> str:
        """
        Extract text from DOCX files
        """
        try:
            doc = docx.Document(file_obj)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text
        except Exception as e:
            logger.error(f"Error parsing DOCX: {str(e)}")
            raise
