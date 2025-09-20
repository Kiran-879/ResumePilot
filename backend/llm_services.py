"""
LLM Services for Resume Analysis and Recommendations
"""

import json
import os
import logging
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass

import openai
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from llm_config import (
    OPENAI_API_KEY, OPENAI_MODEL, EMBEDDING_MODEL, CHROMA_PERSIST_DIRECTORY,
    SCORING_WEIGHTS, RESUME_ANALYSIS_PROMPT, SKILL_EXTRACTION_PROMPT
)

logger = logging.getLogger(__name__)

@dataclass
class AnalysisResult:
    """Data class for LLM analysis results"""
    overall_score: int
    hard_skills_score: int
    soft_skills_score: int
    experience_score: int
    education_score: int
    matched_skills: List[str]
    missing_skills: List[str]
    recommendations: List[str]
    strengths: List[str]
    areas_for_improvement: List[str]
    overall_recommendation: str
    detailed_feedback: str
    semantic_similarity_score: float = 0.0

class LLMService:
    """Service class for OpenAI LLM interactions"""
    
    def __init__(self):
        self.client = openai.OpenAI(api_key=OPENAI_API_KEY)
        self.model = OPENAI_MODEL
    
    def analyze_resume(self, resume_text: str, job_description: str) -> Optional[AnalysisResult]:
        """
        Analyze resume against job description using LLM
        """
        try:
            prompt = RESUME_ANALYSIS_PROMPT.format(
                resume_text=resume_text,
                job_description=job_description
            )
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert HR professional and resume analyst."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=2000
            )
            
            result_text = response.choices[0].message.content
            
            # Parse JSON response
            try:
                result_data = json.loads(result_text)
            except json.JSONDecodeError:
                # Try to extract JSON from the response if it's wrapped in other text
                import re
                json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
                if json_match:
                    result_data = json.loads(json_match.group())
                else:
                    logger.error(f"Failed to parse LLM response as JSON: {result_text}")
                    return None
            
            return AnalysisResult(
                overall_score=result_data.get('overall_score', 0),
                hard_skills_score=result_data.get('hard_skills_score', 0),
                soft_skills_score=result_data.get('soft_skills_score', 0),
                experience_score=result_data.get('experience_score', 0),
                education_score=result_data.get('education_score', 0),
                matched_skills=result_data.get('matched_skills', []),
                missing_skills=result_data.get('missing_skills', []),
                recommendations=result_data.get('recommendations', []),
                strengths=result_data.get('strengths', []),
                areas_for_improvement=result_data.get('areas_for_improvement', []),
                overall_recommendation=result_data.get('overall_recommendation', 'not_recommended'),
                detailed_feedback=result_data.get('detailed_feedback', '')
            )
            
        except Exception as e:
            logger.error(f"LLM analysis failed: {str(e)}")
            return None
    
    def extract_skills(self, text: str) -> List[str]:
        """
        Extract skills from text using LLM
        """
        try:
            prompt = SKILL_EXTRACTION_PROMPT.format(text=text)
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a skills extraction expert."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=500
            )
            
            result_text = response.choices[0].message.content
            
            # Parse JSON array
            try:
                skills = json.loads(result_text)
                return skills if isinstance(skills, list) else []
            except json.JSONDecodeError:
                logger.error(f"Failed to parse skills extraction result: {result_text}")
                return []
                
        except Exception as e:
            logger.error(f"Skill extraction failed: {str(e)}")
            return []

class EmbeddingService:
    """Service class for handling text embeddings and semantic similarity"""
    
    def __init__(self):
        self.model = SentenceTransformer(EMBEDDING_MODEL)
        self.chroma_client = None
        self._setup_chroma()
    
    def _setup_chroma(self):
        """Initialize ChromaDB client"""
        try:
            # Create directory if it doesn't exist
            os.makedirs(CHROMA_PERSIST_DIRECTORY, exist_ok=True)
            
            self.chroma_client = chromadb.PersistentClient(
                path=CHROMA_PERSIST_DIRECTORY
            )
            
            # Get or create collection for resumes
            self.resume_collection = self.chroma_client.get_or_create_collection(
                name="resumes",
                metadata={"description": "Resume embeddings for semantic search"}
            )
            
            # Get or create collection for job descriptions
            self.job_collection = self.chroma_client.get_or_create_collection(
                name="job_descriptions",
                metadata={"description": "Job description embeddings for semantic search"}
            )
            
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB: {str(e)}")
            self.chroma_client = None
    
    def get_embedding(self, text: str) -> np.ndarray:
        """Generate embedding for text"""
        try:
            embedding = self.model.encode(text)
            return embedding
        except Exception as e:
            logger.error(f"Failed to generate embedding: {str(e)}")
            return np.array([])
    
    def calculate_semantic_similarity(self, text1: str, text2: str) -> float:
        """Calculate semantic similarity between two texts"""
        try:
            embedding1 = self.get_embedding(text1)
            embedding2 = self.get_embedding(text2)
            
            if len(embedding1) == 0 or len(embedding2) == 0:
                return 0.0
            
            similarity = cosine_similarity([embedding1], [embedding2])[0][0]
            return float(similarity)
            
        except Exception as e:
            logger.error(f"Failed to calculate semantic similarity: {str(e)}")
            return 0.0
    
    def store_resume_embedding(self, resume_id: str, resume_text: str):
        """Store resume embedding in ChromaDB"""
        if not self.chroma_client:
            return
        
        try:
            embedding = self.get_embedding(resume_text)
            
            self.resume_collection.upsert(
                ids=[resume_id],
                embeddings=[embedding.tolist()],
                documents=[resume_text],
                metadatas=[{"resume_id": resume_id}]
            )
            
        except Exception as e:
            logger.error(f"Failed to store resume embedding: {str(e)}")
    
    def store_job_embedding(self, job_id: str, job_description: str):
        """Store job description embedding in ChromaDB"""
        if not self.chroma_client:
            return
        
        try:
            embedding = self.get_embedding(job_description)
            
            self.job_collection.upsert(
                ids=[job_id],
                embeddings=[embedding.tolist()],
                documents=[job_description],
                metadatas=[{"job_id": job_id}]
            )
            
        except Exception as e:
            logger.error(f"Failed to store job embedding: {str(e)}")
    
    def find_similar_resumes(self, job_description: str, limit: int = 5) -> List[Dict]:
        """Find resumes similar to job description"""
        if not self.chroma_client:
            return []
        
        try:
            job_embedding = self.get_embedding(job_description)
            
            results = self.resume_collection.query(
                query_embeddings=[job_embedding.tolist()],
                n_results=limit
            )
            
            similar_resumes = []
            for i, resume_id in enumerate(results['ids'][0]):
                similar_resumes.append({
                    'resume_id': resume_id,
                    'similarity_score': results['distances'][0][i],
                    'metadata': results['metadatas'][0][i]
                })
            
            return similar_resumes
            
        except Exception as e:
            logger.error(f"Failed to find similar resumes: {str(e)}")
            return []

class EnhancedScoringService:
    """Enhanced scoring service that combines traditional and LLM-based scoring"""
    
    def __init__(self):
        self.llm_service = LLMService()
        self.embedding_service = EmbeddingService()
    
    def comprehensive_evaluation(self, resume_text: str, job_description: str) -> AnalysisResult:
        """
        Perform comprehensive evaluation combining LLM analysis and semantic similarity
        """
        # Get LLM analysis
        llm_result = self.llm_service.analyze_resume(resume_text, job_description)
        
        if not llm_result:
            # Fallback to basic analysis if LLM fails
            return self._fallback_analysis(resume_text, job_description)
        
        # Calculate semantic similarity
        semantic_score = self.embedding_service.calculate_semantic_similarity(
            resume_text, job_description
        )
        
        # Convert similarity to 0-100 scale
        semantic_score_scaled = int(semantic_score * 100)
        
        # Apply weighted scoring
        final_score = self._calculate_weighted_score(
            llm_result.hard_skills_score,
            llm_result.soft_skills_score,
            llm_result.experience_score,
            llm_result.education_score,
            semantic_score_scaled
        )
        
        # Update the result with final scores
        llm_result.overall_score = final_score
        llm_result.semantic_similarity_score = semantic_score
        
        return llm_result
    
    def _calculate_weighted_score(self, hard_skills: int, soft_skills: int, 
                                experience: int, education: int, semantic: int) -> int:
        """Calculate weighted final score"""
        weights = SCORING_WEIGHTS
        
        weighted_score = (
            hard_skills * weights['hard_skills_weight'] +
            soft_skills * weights['soft_skills_weight'] +
            experience * weights['experience_weight'] +
            education * weights['education_weight'] +
            semantic * weights['semantic_similarity_weight']
        )
        
        return int(min(100, max(0, weighted_score)))
    
    def _fallback_analysis(self, resume_text: str, job_description: str) -> AnalysisResult:
        """Fallback analysis when LLM is not available"""
        # Basic semantic similarity
        semantic_score = self.embedding_service.calculate_semantic_similarity(
            resume_text, job_description
        )
        
        base_score = int(semantic_score * 100)
        
        return AnalysisResult(
            overall_score=base_score,
            hard_skills_score=base_score,
            soft_skills_score=max(0, base_score - 10),
            experience_score=max(0, base_score - 5),
            education_score=max(0, base_score - 15),
            matched_skills=[],
            missing_skills=[],
            recommendations=["LLM service unavailable. Basic semantic analysis performed."],
            strengths=["Resume processed successfully"],
            areas_for_improvement=["Unable to provide detailed analysis"],
            overall_recommendation="consider" if base_score > 60 else "not_recommended",
            detailed_feedback=f"Basic semantic similarity score: {base_score}%. Full analysis unavailable.",
            semantic_similarity_score=semantic_score
        )

# Singleton instances
llm_service = LLMService()
embedding_service = EmbeddingService()
enhanced_scoring_service = EnhancedScoringService()