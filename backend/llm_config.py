# LLM Configuration Settings
import os
from django.conf import settings

# OpenAI Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', 'REMOVED_SECRETAAKdQFNbpcDyMGQE7lRYkWD48sE8Qn7R0AqHuvCxqY5eWp3cfZWvlFqTk8VfYyIj0k9HhYMHV3T3BlbkFJUEIufbrmBSGPolNWllAce7u88rtIGTOMbFk9fu34hE7sq2ByDCw53cLBe90e1A5lkAoRDW9U4A')
OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4o-mini')

# Sentence Transformers Model for embeddings
EMBEDDING_MODEL = 'all-MiniLM-L6-v2'

# ChromaDB Configuration
CHROMA_PERSIST_DIRECTORY = os.path.join(settings.BASE_DIR, 'chroma_db')

# Evaluation Scoring Weights
SCORING_WEIGHTS = {
    'hard_skills_weight': 0.4,
    'soft_skills_weight': 0.2,
    'experience_weight': 0.2,
    'education_weight': 0.1,
    'semantic_similarity_weight': 0.1
}

# LLM Prompts
RESUME_ANALYSIS_PROMPT = """
You are an expert HR professional and resume analyst. Analyze the following resume against the job description and provide detailed feedback.

Resume Content:
{resume_text}

Job Description:
{job_description}

Please provide your analysis in the following JSON format:
{{
    "overall_score": <score out of 100>,
    "hard_skills_score": <score out of 100>,
    "soft_skills_score": <score out of 100>,
    "experience_score": <score out of 100>,
    "education_score": <score out of 100>,
    "matched_skills": ["skill1", "skill2", ...],
    "missing_skills": ["skill1", "skill2", ...],
    "recommendations": [
        "Specific recommendation 1",
        "Specific recommendation 2",
        "Specific recommendation 3"
    ],
    "strengths": [
        "Key strength 1",
        "Key strength 2"
    ],
    "areas_for_improvement": [
        "Area for improvement 1",
        "Area for improvement 2"
    ],
    "overall_recommendation": "highly_recommended|recommended|consider|not_recommended",
    "detailed_feedback": "Comprehensive paragraph explaining the evaluation and providing specific advice for the candidate."
}}

Focus on:
1. Technical skills alignment with job requirements
2. Years of experience and relevance
3. Educational background match
4. Soft skills and cultural fit indicators
5. Overall presentation and completeness of resume
6. Specific actionable recommendations for improvement
"""

SKILL_EXTRACTION_PROMPT = """
Extract all technical skills, tools, technologies, and relevant keywords from the following text.
Return only a JSON array of strings, no other text.

Text:
{text}

Return format: ["skill1", "skill2", "skill3", ...]
"""