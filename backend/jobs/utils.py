# jobs/utils.py
import os
import PyPDF2
import docx
import re

def extract_text_from_job_file(file):
    """Extract text from job description file"""
    try:
        file_extension = os.path.splitext(file.name)[1].lower()
        
        if file_extension == '.pdf':
            return extract_text_from_pdf(file)
        elif file_extension in ['.doc', '.docx']:
            return extract_text_from_docx(file)
        elif file_extension == '.txt':
            return file.read().decode('utf-8')
        else:
            return ""
    except Exception as e:
        raise Exception(f"Error extracting text from job file: {str(e)}")

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

def parse_job_description(text):
    """Parse job description to extract structured requirements"""
    parsed_data = {
        'role_title': '',
        'must_have_skills': [],
        'good_to_have_skills': [],
        'qualifications': []
    }
    
    try:
        lines = text.split('\n')
        text_lower = text.lower()
        
        # Common technical skills to look for
        technical_skills = [
            'python', 'java', 'javascript', 'typescript', 'react', 'angular', 
            'vue', 'node.js', 'django', 'flask', 'spring boot', 'mysql', 
            'postgresql', 'mongodb', 'redis', 'aws', 'azure', 'gcp', 
            'docker', 'kubernetes', 'git', 'html', 'css', 'bootstrap',
            'machine learning', 'deep learning', 'data science', 'ai',
            'rest api', 'graphql', 'microservices', 'devops', 'ci/cd'
        ]
        
        # Extract skills mentioned in the text
        found_skills = []
        for skill in technical_skills:
            if skill in text_lower:
                found_skills.append(skill.title())
        
        # Categorize skills based on context
        must_have_indicators = ['required', 'must have', 'essential', 'mandatory', 'minimum']
        nice_to_have_indicators = ['preferred', 'nice to have', 'plus', 'advantage', 'bonus']
        
        must_have_skills = []
        nice_to_have_skills = []
        
        for skill in found_skills:
            skill_context = ""
            # Find context around the skill
            for line in lines:
                if skill.lower() in line.lower():
                    skill_context = line.lower()
                    break
            
            if any(indicator in skill_context for indicator in must_have_indicators):
                must_have_skills.append(skill)
            elif any(indicator in skill_context for indicator in nice_to_have_indicators):
                nice_to_have_skills.append(skill)
            else:
                # Default to must-have if no clear indication
                must_have_skills.append(skill)
        
        # Remove duplicates
        parsed_data['must_have_skills'] = list(set(must_have_skills))
        parsed_data['good_to_have_skills'] = list(set(nice_to_have_skills))
        
        # Extract qualifications
        education_keywords = [
            "bachelor's", "master's", "phd", "degree", "diploma", "certification",
            "computer science", "engineering", "mathematics", "statistics"
        ]
        
        qualifications = []
        for keyword in education_keywords:
            if keyword in text_lower:
                qualifications.append(keyword.title())
        
        parsed_data['qualifications'] = list(set(qualifications))
        
        # Try to extract role title (usually in first few lines)
        for line in lines[:5]:
            line = line.strip()
            if line and len(line) < 100:  # Reasonable title length
                # Skip common headers
                if not any(skip_word in line.lower() for skip_word in ['job description', 'position', 'overview']):
                    parsed_data['role_title'] = line
                    break
    
    except Exception as e:
        # Return basic structure even if parsing fails
        pass
    
    return parsed_data

def process_job_description_async(job_id):
    """Background task to process job description"""
    from .models import JobDescription
    
    try:
        job = JobDescription.objects.get(id=job_id)
        
        # Extract text
        job.raw_text = extract_text_from_job_file(job.job_description_file)
        
        # Parse content
        parsed_data = parse_job_description(job.raw_text)
        
        job.role_title = parsed_data['role_title'] or job.title
        job.must_have_skills = parsed_data['must_have_skills']
        job.good_to_have_skills = parsed_data['good_to_have_skills']
        job.qualifications = parsed_data['qualifications']
        
        job.save()
        
    except Exception as e:
        # Log error but don't fail completely
        print(f"Error processing job description {job_id}: {str(e)}")