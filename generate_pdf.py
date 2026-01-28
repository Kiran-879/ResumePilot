"""
PDF Generator for Resume Checker Project Documentation
"""
from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        self.set_font('Helvetica', 'B', 12)
        self.set_text_color(25, 118, 210)
        self.cell(0, 10, 'Resume Checker - Project Documentation', border=False, align='C')
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f'Page {self.page_no()}', align='C')

    def chapter_title(self, title):
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(25, 118, 210)
        self.cell(0, 10, title)
        self.ln(10)

    def section_title(self, title):
        self.set_font('Helvetica', 'B', 11)
        self.set_text_color(50, 50, 50)
        self.cell(0, 8, title)
        self.ln(8)

    def body_text(self, text):
        self.set_font('Helvetica', '', 10)
        self.set_text_color(0, 0, 0)
        self.multi_cell(0, 6, text)
        self.ln(2)

    def code_block(self, code):
        self.set_font('Courier', '', 7)
        self.set_fill_color(245, 245, 245)
        self.set_text_color(50, 50, 50)
        self.multi_cell(0, 4, code, fill=True)
        self.ln(3)

    def table_row(self, col1, col2, is_header=False):
        if is_header:
            self.set_font('Helvetica', 'B', 9)
            self.set_fill_color(25, 118, 210)
            self.set_text_color(255, 255, 255)
        else:
            self.set_font('Helvetica', '', 9)
            self.set_fill_color(255, 255, 255)
            self.set_text_color(0, 0, 0)
        
        self.cell(55, 7, col1, border=1, fill=True)
        self.cell(0, 7, col2, border=1, fill=True)
        self.ln(7)

    def bullet_point(self, text):
        self.set_font('Helvetica', '', 9)
        self.set_text_color(0, 0, 0)
        self.cell(5, 5, '')
        self.cell(0, 5, '- ' + text)
        self.ln(5)


def create_pdf():
    pdf = PDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    
    # Title Page
    pdf.add_page()
    pdf.set_font('Helvetica', 'B', 24)
    pdf.set_text_color(25, 118, 210)
    pdf.ln(40)
    pdf.cell(0, 15, 'Resume Checker Application', align='C')
    pdf.ln(15)
    pdf.set_font('Helvetica', '', 16)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 10, 'Project Documentation', align='C')
    pdf.ln(20)
    pdf.set_font('Helvetica', '', 12)
    pdf.cell(0, 8, 'Tech Stack | Features | Architecture | Code Samples', align='C')
    pdf.ln(40)
    pdf.set_font('Helvetica', 'I', 10)
    pdf.cell(0, 6, 'Date: January 27, 2026', align='C')
    pdf.ln(6)
    pdf.cell(0, 6, 'Version: 1.0', align='C')
    
    # Table of Contents
    pdf.add_page()
    pdf.chapter_title('Table of Contents')
    pdf.body_text('1. Tech Stack & Algorithms')
    pdf.body_text('2. Features')
    pdf.body_text('3. Most Difficult Part & Solution')
    pdf.body_text('4. System Architecture & Flowchart')
    pdf.body_text('5. Efficient Code Samples')
    
    # Section 1: Tech Stack
    pdf.add_page()
    pdf.chapter_title('1. Tech Stack & Algorithms')
    
    pdf.section_title('Backend Technologies')
    pdf.table_row('Technology', 'Purpose', is_header=True)
    pdf.table_row('Python 3.13', 'Core programming language')
    pdf.table_row('Django 6.0', 'Web framework')
    pdf.table_row('Django REST Framework', 'API development')
    pdf.table_row('SQLite/PostgreSQL', 'Database')
    pdf.table_row('OpenAI GPT API', 'Resume analysis & NLP')
    pdf.table_row('Sentence Transformers', 'Text embeddings')
    pdf.table_row('ChromaDB', 'Vector database for semantic search')
    pdf.table_row('PyPDF2 & python-docx', 'Resume parsing')
    pdf.table_row('openpyxl', 'Excel export functionality')
    pdf.ln(5)
    
    pdf.section_title('Frontend Technologies')
    pdf.table_row('Technology', 'Purpose', is_header=True)
    pdf.table_row('React 19', 'UI framework')
    pdf.table_row('Material UI (MUI) 7', 'Component library')
    pdf.table_row('Axios', 'HTTP client')
    pdf.table_row('React Router 7', 'Navigation')
    pdf.table_row('Recharts', 'Data visualization')
    pdf.table_row('jsPDF', 'PDF generation')
    pdf.table_row('js-cookie', 'Authentication tokens')
    pdf.ln(5)
    
    pdf.section_title('Algorithms Used')
    pdf.body_text('1. Cosine Similarity Algorithm: Similarity = (A.B) / (||A|| x ||B||)')
    pdf.body_text('Used for calculating semantic similarity between resume and job embeddings.')
    
    pdf.body_text('2. Weighted Scoring Algorithm:')
    pdf.code_block('final_score = hard_skills*0.30 + soft_skills*0.15 + experience*0.25 + education*0.15 + semantic*0.15')
    
    pdf.body_text('3. TF-IDF Based Skill Extraction')
    pdf.body_text('4. Vector Embedding Search (384-dimensional vectors)')
    
    # Section 2: Features
    pdf.add_page()
    pdf.chapter_title('2. Features')
    
    pdf.section_title('Authentication System')
    pdf.bullet_point('User registration with email validation')
    pdf.bullet_point('Password strength validation (8+ chars, mixed case, number, special)')
    pdf.bullet_point('Show/Hide password toggle')
    pdf.bullet_point('Role-based access (Student / Placement Team)')
    pdf.bullet_point('Existing user detection during registration')
    pdf.bullet_point('Secure login with proper error messages')
    pdf.bullet_point('JWT Token-based authentication')
    pdf.ln(3)
    
    pdf.section_title('Resume Management')
    pdf.bullet_point('Upload resumes (PDF, DOCX)')
    pdf.bullet_point('Automatic text extraction')
    pdf.bullet_point('Resume storage with Cloudinary')
    pdf.bullet_point('View and delete uploaded resumes')
    pdf.ln(3)
    
    pdf.section_title('Job Management (Placement Team)')
    pdf.bullet_point('Create job postings with descriptions')
    pdf.bullet_point('Upload job description files')
    pdf.bullet_point('Set positions required')
    pdf.bullet_point('Edit/Delete jobs')
    pdf.ln(3)
    
    pdf.section_title('AI-Powered Evaluation')
    pdf.bullet_point('LLM-based resume analysis using OpenAI GPT')
    pdf.bullet_point('Semantic similarity scoring')
    pdf.bullet_point('Skill matching (matched & missing skills)')
    pdf.bullet_point('Multi-dimensional scoring: Hard Skills, Soft Skills, Experience, Education')
    pdf.bullet_point('Recommendations generation')
    pdf.bullet_point('Strengths & Areas for improvement analysis')
    pdf.ln(3)
    
    pdf.section_title('Candidate Shortlisting')
    pdf.bullet_point('View matched candidates per job')
    pdf.bullet_point('First Round Shortlisting feature')
    pdf.bullet_point('Export to Excel (All / Matched 50%+ / Shortlist)')
    pdf.bullet_point('Candidate ranking by score')
    
    # Section 3: Most Difficult Part
    pdf.add_page()
    pdf.chapter_title('3. Most Difficult Part & Solution')
    
    pdf.section_title('The Challenge: Silent Registration/Login Failures')
    pdf.body_text('Problem: When users attempted to register or login, the application displayed generic error or no error at all - just a silent failure.')
    
    pdf.section_title('Why It Was Difficult')
    pdf.bullet_point('Multiple layers: React -> AuthContext -> API Service -> Axios -> Django')
    pdf.bullet_point('No visible errors in UI or console')
    pdf.bullet_point('Backend never received requests')
    pdf.bullet_point('Root cause: CORS (Cross-Origin Resource Sharing) blocking')
    
    pdf.section_title('The Solution')
    pdf.body_text('Step 1: Diagnosed the Request Flow')
    pdf.body_text('User -> React -> AuthContext -> API -> BLOCKED BY CORS -> Django (never received)')
    
    pdf.body_text('Step 2: Found the Configuration Issue')
    pdf.code_block('# BEFORE: CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]')
    
    pdf.body_text('Step 3: Applied the Fix')
    pdf.code_block('# AFTER: Added ports 3001, 3002 and 127.0.0.1 variants')
    
    pdf.section_title('Key Lesson Learned')
    pdf.body_text('When debugging silent failures in full-stack apps, always check CORS first if the backend never receives requests.')
    
    # Section 4: Architecture
    pdf.add_page()
    pdf.chapter_title('4. System Architecture')
    
    pdf.section_title('High-Level Architecture')
    pdf.body_text('FRONTEND (React): Login/Register, Resume Upload, Jobs Listing, Dashboard')
    pdf.body_text('  -> AuthContext, API Services')
    pdf.body_text('  -> HTTP/REST API (Axios)')
    pdf.body_text('')
    pdf.body_text('BACKEND (Django): Django REST Framework')
    pdf.body_text('  -> Auth Module (Login, Register, Profile)')
    pdf.body_text('  -> Evaluations Module (LLM Services, Embedding Service)')
    pdf.body_text('  -> Jobs Module (Create, List, Export)')
    pdf.body_text('  -> Database (SQLite/PostgreSQL)')
    
    pdf.ln(5)
    pdf.section_title('Evaluation Process Flow')
    pdf.body_text('1. Student uploads Resume')
    pdf.body_text('2. Extract text from PDF/DOCX')
    pdf.body_text('3. Get job description and requirements')
    pdf.body_text('4. LLM Analysis (OpenAI GPT): Skill matching, Experience check')
    pdf.body_text('5. Embedding Service: Generate vectors, Cosine similarity')
    pdf.body_text('6. Calculate weighted score')
    pdf.body_text('7. Store in database and return to dashboard')
    
    # Section 5: Efficient Code
    pdf.add_page()
    pdf.chapter_title('5. Efficient Code Samples')
    
    pdf.section_title('5.1 LLM-Enhanced Evaluation Service (Core Algorithm)')
    pdf.body_text('Combines LLM analysis with semantic similarity for accurate scoring:')
    pdf.code_block('''class EnhancedScoringService:
    def comprehensive_evaluation(self, resume_text, job_description):
        llm_result = self.llm_service.analyze_resume(resume_text, job_description)
        if not llm_result:
            return self._fallback_analysis(resume_text, job_description)
        semantic_score = self.embedding_service.calculate_semantic_similarity(
            resume_text, job_description)
        final_score = self._calculate_weighted_score(...)
        return llm_result''')
    pdf.body_text('Why Efficient: Combines AI techniques, has fallback, uses caching.')
    
    pdf.section_title('5.2 Semantic Similarity with Cosine Distance')
    pdf.code_block('''def calculate_semantic_similarity(self, text1, text2):
    embedding1 = self.model.encode(text1)
    embedding2 = self.model.encode(text2)
    similarity = cosine_similarity([embedding1], [embedding2])[0][0]
    return float(similarity)''')
    pdf.body_text('Complexity: O(sequence_length) for embedding, O(384) for similarity.')
    
    pdf.section_title('5.3 Efficient Excel Export')
    pdf.code_block('''evaluations = Evaluation.objects.filter(job_description=job)
    .select_related('resume', 'resume__user')  # Prevents N+1 queries
    .order_by('-overall_score')''')
    pdf.body_text('Efficiency: select_related() prevents N+1 queries.')
    
    # Summary
    pdf.add_page()
    pdf.chapter_title('Summary')
    pdf.table_row('Aspect', 'Details', is_header=True)
    pdf.table_row('Architecture', 'Full-stack: React + Django REST API')
    pdf.table_row('AI/ML', 'OpenAI GPT + Sentence Transformers + ChromaDB')
    pdf.table_row('Key Algorithm', 'Weighted scoring with cosine similarity')
    pdf.table_row('Hardest Challenge', 'CORS config causing silent failures')
    pdf.table_row('Efficient Code', 'EnhancedScoringService (LLM + Embeddings)')
    
    pdf.ln(20)
    pdf.set_font('Helvetica', 'I', 10)
    pdf.set_text_color(128, 128, 128)
    pdf.cell(0, 10, 'Resume Checker Application v1.0 - January 27, 2026', align='C')
    
    # Save PDF
    pdf.output('Resume_Checker_Project_Documentation.pdf')
    print("PDF created successfully: Resume_Checker_Project_Documentation.pdf")

if __name__ == "__main__":
    create_pdf()
