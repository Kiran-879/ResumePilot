# resumes/utils.py
import os
import PyPDF2
import docx
from io import BytesIO
import re
import json

def extract_text_from_file(file):
    """Extract text from uploaded resume file"""
    try:
        file_extension = os.path.splitext(file.name)[1].lower()
        
        if file_extension == '.pdf':
            return extract_text_from_pdf(file)
        elif file_extension in ['.doc', '.docx']:
            return extract_text_from_docx(file)
        else:
            return ""
    except Exception as e:
        raise Exception(f"Error extracting text from file: {str(e)}")

def extract_text_from_pdf(file):
    """Extract text from PDF file"""
    try:
        pdf_reader = PyPDF2.PdfReader(file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        raise Exception(f"Error reading PDF: {str(e)}")

def extract_text_from_docx(file):
    """Extract text from DOCX file"""
    try:
        doc = docx.Document(file)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    except Exception as e:
        raise Exception(f"Error reading DOCX: {str(e)}")

def extract_person_name(text):
    """Extract person's name from resume text"""
    import spacy
    from spacy import displacy
    import re
    
    # Common technical terms and libraries to exclude
    tech_exclusions = {
        'python', 'java', 'javascript', 'react', 'angular', 'vue', 'node',
        'django', 'flask', 'spring', 'mysql', 'postgresql', 'mongodb',
        'aws', 'azure', 'docker', 'kubernetes', 'git', 'html', 'css',
        'matplotlib', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'sklearn',
        'bootstrap', 'jquery', 'express', 'fastapi', 'redis', 'elasticsearch'
    }
    
    try:
        # Try to load spaCy model for better name recognition
        try:
            nlp = spacy.load("en_core_web_sm")
            doc = nlp(text)
            
            # Look for PERSON entities
            person_names = []
            for ent in doc.ents:
                if ent.label_ == "PERSON":
                    candidate_name = ent.text.strip()
                    # Filter out technical terms
                    if candidate_name.lower() not in tech_exclusions:
                        person_names.append(candidate_name)
            
            if person_names:
                # Return the first person name found (likely the candidate)
                return person_names[0]
        except OSError:
            # spaCy model not installed, fall back to regex patterns
            pass
    except ImportError:
        # spaCy not installed, use regex patterns
        pass
    
    # Fallback: Use regex patterns to extract likely names
    lines = text.split('\n')
    
    # Pattern 1: Look for name-like patterns at the beginning of the resume
    name_patterns = [
        r'^([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)',  # John Smith or John Smith Jr
        r'^([A-Z][a-z]+(?:\s[A-Z]\.?)+ [A-Z][a-z]+)',     # John A. Smith
        r'^([A-Z]{2,}\s+[A-Z]{2,})',                       # JOHN SMITH (all caps)
    ]
    
    # Check first few lines for name patterns
    for i, line in enumerate(lines[:5]):
        line = line.strip()
        if not line:
            continue
            
        # Skip obvious non-name lines
        if any(keyword in line.lower() for keyword in [
            'resume', 'cv', 'curriculum', 'vitae', 'phone', 'email', 
            'address', 'linkedin', 'github', '@', 'http', 'www'
        ]):
            continue
            
        for pattern in name_patterns:
            match = re.match(pattern, line)
            if match:
                candidate_name = match.group(1).strip()
                # Basic validation: should be 2-4 words, each 2+ characters
                words = candidate_name.split()
                if (2 <= len(words) <= 4 and 
                    all(len(word) >= 2 for word in words) and
                    candidate_name.lower() not in tech_exclusions):
                    return candidate_name
    
    # Pattern 2: Look for "Name:" or "Full Name:" labels
    name_label_pattern = r'(?:name|full\s*name):\s*([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)'
    for line in lines[:10]:
        match = re.search(name_label_pattern, line, re.IGNORECASE)
        if match:
            candidate_name = match.group(1).strip()
            if candidate_name.lower() not in tech_exclusions:
                return candidate_name
    
    # Pattern 3: Handle names split across multiple lines (common in PDF extraction)
    # Look for single words that might be first/last name at the beginning
    potential_name_parts = []
    for i, line in enumerate(lines[:5]):
        line = line.strip()
        if not line:
            continue
            
        # Skip lines with obvious non-name content
        if any(char in line for char in ['@', '|', 'http', 'www']):
            continue
        if any(keyword in line.lower() for keyword in [
            'resume', 'cv', 'objective', 'profile', 'summary'
        ]):
            continue
            
        # Check if it's a single word that could be part of a name
        words = line.split()
        if (len(words) == 1 and 
            2 <= len(words[0]) <= 20 and 
            words[0][0].isupper() and 
            words[0].isalpha() and
            words[0].lower() not in tech_exclusions):
            potential_name_parts.append(words[0])
            
            # If we have 2-3 parts, try to form a name
            if 2 <= len(potential_name_parts) <= 3:
                candidate_name = ' '.join(potential_name_parts)
                return candidate_name
    
    # Pattern 4: Look for the largest text at the top (common in formatted resumes)
    for line in lines[:3]:
        line = line.strip()
        if len(line) > 5 and len(line) < 50:  # Reasonable name length
            # Check if it looks like a name (multiple words, proper capitalization)
            words = line.split()
            if (2 <= len(words) <= 4 and 
                all(word[0].isupper() and len(word) >= 2 for word in words) and
                not any(char.isdigit() or char in '@.()[]{}' for char in line) and
                line.lower() not in tech_exclusions):
                return line
    
    return None

def parse_resume_content(text):
    """Parse resume content to extract structured information"""
    parsed_data = {
        'personal_info': {},
        'skills': [],
        'experience': [],
        'education': [],
        'projects': [],
        'certifications': []
    }
    
    try:
        # Extract person's name
        extracted_name = extract_person_name(text)
        if extracted_name:
            parsed_data['personal_info']['name'] = extracted_name
            
        # Extract email
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text)
        if emails:
            parsed_data['personal_info']['email'] = emails[0]
        
        # Extract phone number
        phone_pattern = r'(\+\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}'
        phones = re.findall(phone_pattern, text)
        if phones:
            parsed_data['personal_info']['phone'] = phones[0]
        
        # Extract skills (simple keyword matching)
        skills_keywords = [
            'python', 'java', 'javascript', 'react', 'angular', 'vue', 'node',
            'django', 'flask', 'spring', 'mysql', 'postgresql', 'mongodb',
            'aws', 'azure', 'docker', 'kubernetes', 'git', 'html', 'css',
            'machine learning', 'data science', 'artificial intelligence'
        ]
        
        text_lower = text.lower()
        found_skills = []
        for skill in skills_keywords:
            if skill in text_lower:
                found_skills.append(skill.title())
        
        parsed_data['skills'] = found_skills
        
        # Simple experience extraction (look for common patterns)
        experience_lines = []
        lines = text.split('\n')
        
        for i, line in enumerate(lines):
            if any(keyword in line.lower() for keyword in ['experience', 'work', 'employment']):
                # Try to extract next few lines as experience
                for j in range(i+1, min(i+5, len(lines))):
                    if lines[j].strip():
                        experience_lines.append(lines[j].strip())
        
        if experience_lines:
            parsed_data['experience'] = [{'description': exp} for exp in experience_lines[:3]]
        
        # Simple education extraction
        education_keywords = ['education', 'degree', 'university', 'college', 'bachelor', 'master', 'phd']
        education_lines = []
        
        for i, line in enumerate(lines):
            if any(keyword in line.lower() for keyword in education_keywords):
                for j in range(i, min(i+3, len(lines))):
                    if lines[j].strip():
                        education_lines.append(lines[j].strip())
        
        if education_lines:
            parsed_data['education'] = [{'degree': edu} for edu in education_lines[:2]]
    
    except Exception as e:
        # Return basic structure even if parsing fails
        pass
    
    return parsed_data

def process_resume_async(resume_id):
    """Background task to process resume (placeholder for Celery task)"""
    from .models import Resume
    
    try:
        resume = Resume.objects.get(id=resume_id)
        resume.processing_status = 'processing'
        resume.save()
        
        # Extract text
        resume.raw_text = extract_text_from_file(resume.file)
        
        # Parse content
        parsed_data = parse_resume_content(resume.raw_text)
        
        resume.personal_info = parsed_data['personal_info']
        resume.skills = parsed_data['skills']
        resume.experience = parsed_data['experience']
        resume.education = parsed_data['education']
        resume.projects = parsed_data['projects']
        resume.certifications = parsed_data['certifications']
        
        resume.processing_status = 'processed'
        resume.save()
        
    except Exception as e:
        resume.processing_status = 'error'
        resume.error_message = str(e)
        resume.save()