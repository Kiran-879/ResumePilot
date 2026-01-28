"""
Complete PDF Generator for Resume Checker Project - All Q&A Documentation
"""
from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        self.set_font('Helvetica', 'B', 11)
        self.set_text_color(25, 118, 210)
        self.cell(0, 10, 'Resume Checker - Complete Project Documentation', border=False, align='C')
        self.ln(8)
        # Add a line
        self.set_draw_color(25, 118, 210)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f'Page {self.page_no()}', align='C')

    def chapter_title(self, title):
        self.set_font('Helvetica', 'B', 16)
        self.set_text_color(25, 118, 210)
        self.cell(0, 12, title)
        self.ln(12)

    def section_title(self, title):
        self.set_font('Helvetica', 'B', 12)
        self.set_text_color(50, 50, 50)
        self.cell(0, 8, title)
        self.ln(8)

    def subsection_title(self, title):
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(80, 80, 80)
        self.cell(0, 7, title)
        self.ln(7)

    def body_text(self, text):
        self.set_font('Helvetica', '', 10)
        self.set_text_color(0, 0, 0)
        self.multi_cell(0, 6, text)
        self.ln(2)

    def code_block(self, code):
        self.set_font('Courier', '', 7)
        self.set_fill_color(240, 240, 240)
        self.set_text_color(50, 50, 50)
        self.multi_cell(0, 4, code, fill=True)
        self.ln(3)

    def table_header(self, col1, col2, w1=55, w2=135):
        self.set_font('Helvetica', 'B', 9)
        self.set_fill_color(25, 118, 210)
        self.set_text_color(255, 255, 255)
        self.cell(w1, 7, col1, border=1, fill=True, align='C')
        self.cell(w2, 7, col2, border=1, fill=True, align='C')
        self.ln(7)

    def table_row(self, col1, col2, w1=55, w2=135):
        self.set_font('Helvetica', '', 9)
        self.set_fill_color(250, 250, 250)
        self.set_text_color(0, 0, 0)
        self.cell(w1, 7, col1, border=1, fill=True)
        self.cell(w2, 7, col2, border=1, fill=True)
        self.ln(7)

    def bullet_point(self, text, indent=5):
        self.set_font('Helvetica', '', 9)
        self.set_text_color(0, 0, 0)
        self.cell(indent, 5, '')
        self.multi_cell(0, 5, '• ' + text)


def create_pdf():
    pdf = PDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    
    # ========== TITLE PAGE ==========
    pdf.add_page()
    pdf.set_font('Helvetica', 'B', 28)
    pdf.set_text_color(25, 118, 210)
    pdf.ln(50)
    pdf.cell(0, 15, 'Resume Checker Application', align='C')
    pdf.ln(20)
    pdf.set_font('Helvetica', '', 18)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 10, 'Complete Project Documentation', align='C')
    pdf.ln(15)
    pdf.set_font('Helvetica', '', 14)
    pdf.cell(0, 8, 'Q&A Reference Guide', align='C')
    pdf.ln(30)
    
    # Contents box
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(50, 50, 50)
    pdf.cell(0, 8, 'Contents:', align='C')
    pdf.ln(10)
    pdf.set_font('Helvetica', '', 11)
    contents = [
        '1. Tech Stack',
        '2. Features',
        '3. Most Difficult Part & Solution',
        '4. System Architecture & Flowchart',
        '5. Efficient Code Samples',
        '6. Algorithms'
    ]
    for item in contents:
        pdf.cell(0, 7, item, align='C')
        pdf.ln(7)
    
    pdf.ln(30)
    pdf.set_font('Helvetica', 'I', 10)
    pdf.set_text_color(128, 128, 128)
    pdf.cell(0, 6, 'Date: January 28, 2026', align='C')
    pdf.ln(6)
    pdf.cell(0, 6, 'Version: 1.0', align='C')
    
    # ========== 1. TECH STACK ==========
    pdf.add_page()
    pdf.chapter_title('1. Tech Stack')
    
    pdf.section_title('Backend Technologies')
    pdf.table_header('Technology', 'Purpose')
    pdf.table_row('Python', 'Core programming language')
    pdf.table_row('Django 4.0+', 'Web framework')
    pdf.table_row('Django REST Framework', 'Building REST APIs')
    pdf.table_row('SQLite', 'Database')
    pdf.table_row('OpenAI API', 'LLM-powered resume evaluation')
    pdf.table_row('Gunicorn', 'Production WSGI server')
    pdf.table_row('Cloudinary', 'Cloud storage for files')
    pdf.table_row('PyPDF2', 'PDF parsing for resumes')
    pdf.table_row('python-docx', 'Word document parsing')
    pdf.table_row('openpyxl', 'Excel file handling')
    pdf.table_row('Sentence Transformers', 'Text embeddings')
    pdf.table_row('ChromaDB', 'Vector database for semantic search')
    pdf.ln(5)
    
    pdf.section_title('Frontend Technologies')
    pdf.table_header('Technology', 'Purpose')
    pdf.table_row('React 19', 'UI framework')
    pdf.table_row('Material UI (MUI) 7', 'Component library & styling')
    pdf.table_row('React Router DOM 7', 'Client-side routing')
    pdf.table_row('Axios', 'HTTP requests to backend API')
    pdf.table_row('Recharts', 'Data visualization/charts')
    pdf.table_row('jsPDF', 'PDF generation on frontend')
    pdf.table_row('React Dropzone', 'File upload handling')
    pdf.table_row('React Toastify', 'Toast notifications')
    pdf.table_row('js-cookie', 'Cookie management (auth tokens)')
    pdf.ln(5)
    
    pdf.section_title('Infrastructure/Deployment')
    pdf.bullet_point('Render - Hosting platform')
    pdf.bullet_point('Cloudinary - Media/file storage')
    pdf.bullet_point('ChromaDB - Vector database for embeddings')
    
    # ========== 2. FEATURES ==========
    pdf.add_page()
    pdf.chapter_title('2. Features')
    
    pdf.section_title('Authentication & User Management')
    pdf.bullet_point('User Registration with role selection (Student / Placement Team)')
    pdf.bullet_point('Role-Based Login with separate flows')
    pdf.bullet_point('Token Authentication for secure API access')
    pdf.bullet_point('User Profiles management')
    pdf.bullet_point('Role-Based Access Control (RBAC)')
    pdf.ln(3)
    
    pdf.section_title('Resume Management')
    pdf.bullet_point('Resume Upload (PDF/Word) with drag-and-drop support')
    pdf.bullet_point('Cloud Storage on Cloudinary')
    pdf.bullet_point('Automatic Text Extraction from uploaded resumes')
    pdf.bullet_point('Resume Download functionality')
    pdf.bullet_point('Resume Listing (role-based visibility)')
    pdf.ln(3)
    
    pdf.section_title('Job Management')
    pdf.bullet_point('Job Posting by Placement Team')
    pdf.bullet_point('Job Details: Title, company, location, description, requirements')
    pdf.bullet_point('Priority Levels: High/Medium/Low')
    pdf.bullet_point('Position Count tracking')
    pdf.bullet_point('Job Filtering by priority, company')
    pdf.bullet_point('Active/Inactive Status toggle')
    pdf.ln(3)
    
    pdf.section_title('AI-Powered Resume Evaluation')
    pdf.bullet_point('LLM-Enhanced Scoring using OpenAI GPT')
    pdf.bullet_point('Multi-Dimensional Scoring: Hard skills, soft skills, experience, education')
    pdf.bullet_point('Semantic Similarity using vector embeddings')
    pdf.bullet_point('Skills Analysis: Matched vs. missing skills')
    pdf.bullet_point('Strengths & Weaknesses identification')
    pdf.bullet_point('AI-Generated Recommendations')
    pdf.bullet_point('Final Verdict: Highly Recommended / Recommended / Not Recommended')
    pdf.ln(3)
    
    pdf.section_title('Job Application System')
    pdf.bullet_point('Apply to Jobs with resume selection')
    pdf.bullet_point('Application Tracking: Applied -> Shortlisted -> Interview -> Selected')
    pdf.bullet_point('Duplicate Prevention (one application per job)')
    pdf.bullet_point('Auto-Evaluation triggered on application')
    pdf.ln(3)
    
    pdf.section_title('Candidate Management (Placement Team)')
    pdf.bullet_point('View Matched Candidates sorted by score')
    pdf.bullet_point('Candidate Shortlisting with status updates')
    pdf.bullet_point('Add Notes to applications')
    pdf.bullet_point('Excel Export for shortlists')
    pdf.bullet_point('Round-Based Shortlisting support')
    pdf.ln(3)
    
    pdf.section_title('Export & Reports')
    pdf.bullet_point('PDF Generation using jsPDF')
    pdf.bullet_point('Excel Export using openpyxl')
    pdf.bullet_point('Shortlist Reports (round-wise)')
    
    # ========== 3. MOST DIFFICULT PART ==========
    pdf.add_page()
    pdf.chapter_title('3. Most Difficult Part & Solution')
    
    pdf.section_title('The Problem: Silent Registration/Login Failures')
    pdf.body_text('When users tried to register or login, the application showed generic errors or no error at all - just a silent failure. Nothing happened when clicking the submit button.')
    pdf.ln(3)
    
    pdf.section_title('Why It Was Difficult to Debug')
    pdf.body_text('Multiple layers were involved in the request flow:')
    pdf.bullet_point('React UI - No visible error messages')
    pdf.bullet_point('AuthContext - Appeared to work correctly')
    pdf.bullet_point('API Service - Sent the request')
    pdf.bullet_point('Axios - Request sent but blocked')
    pdf.bullet_point('Django Backend - NEVER received the request!')
    pdf.ln(2)
    pdf.body_text('The tricky part: Every layer looked fine individually, but the backend logs showed zero incoming requests.')
    pdf.ln(3)
    
    pdf.section_title('Root Cause: CORS (Cross-Origin Resource Sharing)')
    pdf.body_text('The browser was silently blocking requests because the frontend origin was not in Django\'s allowed list.')
    pdf.ln(2)
    pdf.body_text('Request Flow:')
    pdf.code_block('User -> React -> AuthContext -> API -> BLOCKED BY CORS -> Django (never received)')
    pdf.ln(2)
    pdf.body_text('The issue: Frontend was running on localhost:3001 or localhost:3002, but Django only allowed localhost:3000.')
    pdf.ln(3)
    
    pdf.section_title('The Solution')
    pdf.body_text('Before (Broken):')
    pdf.code_block('CORS_ALLOWED_ORIGINS = [\n    "http://localhost:3000",\n]')
    pdf.ln(2)
    pdf.body_text('After (Fixed):')
    pdf.code_block('CORS_ALLOWED_ORIGINS = [\n    "http://localhost:3000",\n    "http://localhost:3001",\n    "http://localhost:3002",\n    "http://127.0.0.1:3000",\n    "http://127.0.0.1:3001",\n    "http://127.0.0.1:3002",\n]')
    pdf.ln(3)
    
    pdf.section_title('Key Lesson Learned')
    pdf.body_text('When debugging silent failures in full-stack apps, always check CORS first if the backend never receives requests. The browser blocks cross-origin requests without obvious errors in the UI - you need to check the browser\'s Network tab or Console where CORS errors appear.')
    
    # ========== 4. SYSTEM ARCHITECTURE ==========
    pdf.add_page()
    pdf.chapter_title('4. System Architecture & Flowchart')
    
    pdf.section_title('High-Level Architecture')
    pdf.code_block('''
+------------------------------------------------------------------+
|                     FRONTEND (React 19)                           |
|  [Login/Register] [Resume Upload] [Jobs Listing] [Dashboard]     |
|                          |                                        |
|                    AuthContext + API Services                     |
+------------------------------------------------------------------+
                           | HTTP/REST (Axios)
                           v
+------------------------------------------------------------------+
|                  BACKEND (Django REST Framework)                  |
|                                                                   |
|  [Authentication]    [Evaluations]      [Jobs]      [Resumes]    |
|   - Register          - LLM Service      - Create     - Upload   |
|   - Login             - Embeddings       - List       - Extract  |
|   - Profile           - Scoring          - Export     - Store    |
|                                                                   |
+------------------------------------------------------------------+
                           |
         +-----------------+-----------------+
         |                 |                 |
    [SQLite DB]      [ChromaDB]       [Cloudinary]
    (Data)           (Vectors)         (Files)
                           |
                    [OpenAI GPT API]
                    (Resume Analysis)
''')
    pdf.ln(5)
    
    pdf.section_title('Resume Evaluation Process Flow')
    pdf.code_block('''
[Student Uploads Resume]
         |
         v
[Extract Text from PDF/DOCX]
         |
         v
[Store Resume in Cloudinary]
         |
         v
[Student Applies to a Job]
         |
         v
[Get Job Description & Requirements]
         |
    +----+----+
    |         |
    v         v
[LLM Analysis]  [Embedding Service]
  (GPT)           (Vectors)
    |         |
    +----+----+
         |
         v
[Skills Matching]
  - Hard Skills
  - Soft Skills
  - Experience
  - Education
         |
         v
[Cosine Similarity Calculation]
         |
         v
[Weighted Score Calculation]
  Hard Skills:   30%
  Experience:    25%
  Soft Skills:   15%
  Education:     15%
  Semantic:      15%
         |
         v
[Generate Results & Store in DB]
''')
    pdf.ln(5)
    
    pdf.section_title('User Role Flow')
    pdf.code_block('''
                    [New User]
                        |
                        v
                  [Registration]
                  (Select Role)
                        |
        +---------------+---------------+
        |               |               |
        v               v               v
    [STUDENT]    [PLACEMENT TEAM]    [ADMIN]
        |               |               |
   - Upload Resume  - Create Jobs   - All Features
   - View Jobs      - View Resumes  - User Mgmt
   - Apply to Jobs  - Evaluations
   - My Evaluation  - Shortlist
   - My Apps        - Export Excel
''')
    pdf.ln(5)
    
    pdf.section_title('Application Status Flow')
    pdf.code_block('[Applied] -> [Under Review] -> [Shortlisted] -> [Interview] -> [Selected]\n                    |                |                             \n                    v                v                             \n              [Rejected]       [Rejected]                          ')
    
    # ========== 5. EFFICIENT CODE ==========
    pdf.add_page()
    pdf.chapter_title('5. Efficient Code Samples')
    
    pdf.section_title('5.1 Enhanced Scoring Service (Core AI Algorithm)')
    pdf.body_text('Combines LLM analysis with semantic similarity for accurate scoring:')
    pdf.code_block('''class EnhancedScoringService:
    def __init__(self):
        self.llm_service = LLMService()
        self.embedding_service = EmbeddingService()
    
    def comprehensive_evaluation(self, resume_text, job_description):
        # Get LLM analysis
        llm_result = self.llm_service.analyze_resume(resume_text, job_description)
        
        if not llm_result:
            return self._fallback_analysis(resume_text, job_description)
        
        # Calculate semantic similarity
        semantic_score = self.embedding_service.calculate_semantic_similarity(
            resume_text, job_description
        )
        
        # Apply weighted scoring
        final_score = self._calculate_weighted_score(...)
        
        llm_result.overall_score = final_score
        return llm_result''')
    pdf.body_text('Why Efficient: Graceful fallback, combined AI + ML analysis, singleton pattern.')
    pdf.ln(3)
    
    pdf.section_title('5.2 Cosine Similarity Calculation')
    pdf.code_block('''def calculate_semantic_similarity(self, text1, text2):
    embedding1 = self.model.encode(text1)  # 384-dim vector
    embedding2 = self.model.encode(text2)
    
    similarity = cosine_similarity([embedding1], [embedding2])[0][0]
    return float(similarity)  # 0.0 to 1.0''')
    pdf.body_text('Time Complexity: O(n) for encoding + O(384) for similarity calculation.')
    pdf.ln(3)
    
    pdf.section_title('5.3 Weighted Scoring Algorithm')
    pdf.code_block('''def _calculate_weighted_score(self, hard_skills, soft_skills, 
                              experience, education, semantic):
    weighted_score = (
        hard_skills * 0.30 +  # 30%
        soft_skills * 0.15 +  # 15%
        experience * 0.25 +   # 25%
        education * 0.15 +    # 15%
        semantic * 0.15       # 15%
    )
    return int(min(100, max(0, weighted_score)))  # Clamp 0-100''')
    pdf.ln(3)
    
    pdf.section_title('5.4 Efficient Database Query (N+1 Prevention)')
    pdf.code_block('''evaluations = Evaluation.objects.filter(job_description=job)
    .select_related('resume', 'resume__user')  # Single query with JOINs
    .order_by('-overall_score')

# Without select_related: 2N+1 queries
# With select_related: 1 query''')
    pdf.ln(3)
    
    pdf.section_title('5.5 Vector Similarity Search (ChromaDB)')
    pdf.code_block('''def find_similar_resumes(self, job_description, limit=5):
    job_embedding = self.get_embedding(job_description)
    
    results = self.resume_collection.query(
        query_embeddings=[job_embedding.tolist()],
        n_results=limit  # Top N similar resumes
    )
    return results  # O(log n) search instead of O(n)''')
    
    # ========== 6. ALGORITHMS ==========
    pdf.add_page()
    pdf.chapter_title('6. Algorithms')
    
    pdf.section_title('6.1 Cosine Similarity Algorithm')
    pdf.body_text('Purpose: Measure semantic similarity between resume and job description.')
    pdf.body_text('Formula: Similarity = (A . B) / (||A|| x ||B||)')
    pdf.body_text('Where A and B are 384-dimensional text embeddings.')
    pdf.code_block('''Resume Text -> Sentence Transformer -> 384-dim Vector (A)
Job Description -> Sentence Transformer -> 384-dim Vector (B)
Similarity = dot_product(A, B) / (magnitude(A) x magnitude(B))
Result: 0.0 (no match) to 1.0 (perfect match)''')
    pdf.ln(3)
    
    pdf.section_title('6.2 Weighted Scoring Algorithm')
    pdf.body_text('Purpose: Combine multiple evaluation dimensions into one overall score.')
    pdf.body_text('Formula: Score = (H x 0.30) + (E x 0.25) + (S x 0.15) + (Ed x 0.15) + (Sem x 0.15)')
    pdf.ln(2)
    pdf.table_header('Component', 'Weight', 60, 60)
    pdf.table_row('Hard Skills (H)', '30%', 60, 60)
    pdf.table_row('Experience (E)', '25%', 60, 60)
    pdf.table_row('Soft Skills (S)', '15%', 60, 60)
    pdf.table_row('Education (Ed)', '15%', 60, 60)
    pdf.table_row('Semantic (Sem)', '15%', 60, 60)
    pdf.ln(3)
    
    pdf.section_title('6.3 Text Embedding Algorithm')
    pdf.body_text('Model: all-MiniLM-L6-v2 (Sentence Transformers)')
    pdf.body_text('Output: 384-dimensional dense vector representing text meaning.')
    pdf.code_block('''Input: "5 years Python experience with Django REST APIs"
    -> Tokenization
    -> Transformer Encoding (6 layers)
    -> Mean Pooling
    -> Output: [0.023, -0.156, 0.089, ..., 0.234] (384 numbers)''')
    pdf.ln(3)
    
    pdf.section_title('6.4 Approximate Nearest Neighbor (ANN) Search')
    pdf.body_text('Algorithm: HNSW (Hierarchical Navigable Small World) in ChromaDB')
    pdf.body_text('Purpose: Quickly find similar resumes from database.')
    pdf.body_text('Time Complexity: O(log n) vs O(n) for brute force.')
    pdf.ln(3)
    
    pdf.section_title('6.5 Algorithm Complexity Summary')
    pdf.table_header('Algorithm', 'Time Complexity', 95, 95)
    pdf.table_row('Cosine Similarity', 'O(d) where d=384', 95, 95)
    pdf.table_row('Text Embedding', 'O(n) where n=tokens', 95, 95)
    pdf.table_row('Weighted Scoring', 'O(1)', 95, 95)
    pdf.table_row('ANN Search (HNSW)', 'O(log n)', 95, 95)
    pdf.table_row('Skill Matching', 'O(s x n)', 95, 95)
    pdf.table_row('Candidate Ranking', 'O(n log n)', 95, 95)
    
    # ========== SUMMARY PAGE ==========
    pdf.add_page()
    pdf.chapter_title('Summary')
    
    pdf.table_header('Aspect', 'Details')
    pdf.table_row('Architecture', 'Full-stack: React 19 + Django REST Framework')
    pdf.table_row('AI/ML', 'OpenAI GPT + Sentence Transformers + ChromaDB')
    pdf.table_row('Key Algorithm', 'Weighted scoring with cosine similarity')
    pdf.table_row('Database', 'SQLite + ChromaDB (vectors) + Cloudinary (files)')
    pdf.table_row('Hardest Challenge', 'CORS configuration causing silent failures')
    pdf.table_row('Solution', 'Added all frontend origins to CORS_ALLOWED_ORIGINS')
    pdf.table_row('Efficient Code', 'EnhancedScoringService (LLM + Embeddings)')
    
    pdf.ln(20)
    pdf.set_font('Helvetica', 'I', 10)
    pdf.set_text_color(128, 128, 128)
    pdf.cell(0, 10, 'Resume Checker Application - Complete Documentation', align='C')
    pdf.ln(6)
    pdf.cell(0, 10, 'Generated: January 28, 2026', align='C')
    
    # Save PDF
    output_file = 'Resume_Checker_Complete_QA_Documentation.pdf'
    pdf.output(output_file)
    print(f"PDF created successfully: {output_file}")
    return output_file

if __name__ == "__main__":
    create_pdf()
