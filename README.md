# 📄 Resume Checker - AI-Powered Resume Evaluation System

An intelligent resume screening application that uses **OpenAI GPT** and **Semantic Similarity** to evaluate resumes against job descriptions, helping placement teams streamline their recruitment process.

![Python](https://img.shields.io/badge/Python-3.10+-blue)
![Django](https://img.shields.io/badge/Django-4.0+-green)
![React](https://img.shields.io/badge/React-19-61DAFB)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT-412991)
![MUI](https://img.shields.io/badge/Material--UI-7-007FFF)

---

## 🚀 Features

### 👨‍🎓 For Students

| Feature | Description |
|---------|-------------|
| **Dashboard** | Personalized welcome screen with resume status, score overview, and tips |
| **Resume Upload** | Upload PDF/DOCX resumes with drag-and-drop support |
| **My Resumes** | View and manage uploaded resumes |
| **Browse Jobs** | View all available job openings posted by placement team |
| **Apply to Jobs** | Select a resume and apply to jobs directly |
| **Application Tracking** | Track application status (Applied → Under Review → Shortlisted → Interview → Selected/Rejected) |
| **My Evaluations** | View AI evaluation scores and detailed feedback |
| **Score Overview** | See average match score across all evaluations |
| **Application Stats** | View total applied, pending, shortlisted, and rejected counts |

### 👔 For Placement Team

| Feature | Description |
|---------|-------------|
| **Dashboard** | Overview of all resumes, jobs, and evaluation statistics |
| **Create Jobs** | Post new job openings with title, company, location, requirements, priority |
| **Job Management** | Edit, delete, and manage job postings |
| **View Student Resumes** | Access all student-uploaded resumes |
| **Matched Candidates** | View candidates sorted by AI evaluation score per job |
| **Candidate Details** | See detailed scores (Hard Skills, Soft Skills, Experience, Education) |
| **First Round Shortlisting** | Select top N candidates for shortlisting |
| **Export to Excel** | Export candidate lists (All / Matched 50%+ / Shortlist) |
| **Update Application Status** | Change student application status with notes |
| **Evaluation Statistics** | View total evaluations, recommendations breakdown |

### 🤖 AI Evaluation Features

- 🧠 **LLM-Based Analysis**: OpenAI GPT for intelligent resume parsing and evaluation
- 📊 **Multi-Dimensional Scoring**: 
  - Hard Skills Score
  - Soft Skills Score  
  - Experience Score
  - Education Score
  - Semantic Similarity Score
- 🔍 **Semantic Matching**: Vector embeddings with Sentence Transformers (384-dim)
- 💡 **Smart Recommendations**: AI-generated improvement suggestions
- ✨ **Skills Gap Analysis**: Matched vs Missing skills identification
- 🏆 **Final Recommendation**: Highly Recommended / Recommended / Consider / Not Recommended

---

## 📊 Scoring Algorithm

```
Final Score = (Hard Skills × 30%) + (Experience × 25%) + 
              (Soft Skills × 15%) + (Education × 15%) + 
              (Semantic Similarity × 15%)
```

| Component | Weight | Description |
|-----------|--------|-------------|
| Hard Skills | 30% | Technical skills match with job requirements |
| Experience | 25% | Work experience relevance |
| Soft Skills | 15% | Communication, teamwork, leadership |
| Education | 15% | Academic qualifications |
| Semantic | 15% | Overall text similarity using cosine distance |

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Python** | Core programming language |
| **Django 4.0+** | Web framework |
| **Django REST Framework** | REST API |
| **OpenAI GPT** | LLM-powered resume analysis |
| **Sentence Transformers** | Text embeddings (384-dim vectors) |
| **ChromaDB** | Vector database for semantic search |
| **SQLite** | Database |
| **Cloudinary** | Cloud file storage |
| **PyPDF2 / python-docx** | Document parsing |
| **openpyxl** | Excel export |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **Material UI 7** | Component library |
| **React Router 7** | Client-side routing |
| **Axios** | HTTP client |
| **Recharts** | Data visualization |
| **jsPDF** | PDF report generation |
| **React Dropzone** | File upload |
| **React Toastify** | Notifications |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React 19)                       │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  STUDENT VIEW          │  PLACEMENT TEAM VIEW       │    │
│  │  ─────────────         │  ──────────────────        │    │
│  │  • Dashboard           │  • Dashboard               │    │
│  │  • Upload Resume       │  • Create Jobs             │    │
│  │  • My Resumes          │  • View Student Resumes    │    │
│  │  • Browse Jobs         │  • Matched Candidates      │    │
│  │  • Apply to Jobs       │  • Export to Excel         │    │
│  │  • My Applications     │  • Update App Status       │    │
│  │  • My Evaluations      │  • All Evaluations         │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                   │
│              AuthContext + API Services (Axios)              │
└─────────────────────────────┬───────────────────────────────┘
                              │ REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND (Django REST Framework)              │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │Authentication│  │  Evaluations │  │    Jobs      │       │
│  │  • Register  │  │  • Evaluate  │  │  • CRUD      │       │
│  │  • Login     │  │  • Apply     │  │  • Matched   │       │
│  │  • Profile   │  │  • Status    │  │  • Export    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                           │                                  │
│           ┌───────────────┼───────────────┐                 │
│           ▼               ▼               ▼                 │
│     [LLM Service]  [Embedding Service]  [Resumes Module]    │
│      (OpenAI)    (Sentence Transformers)   • Upload         │
│                                            • Extract        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   SQLite    │  │  ChromaDB   │  │ Cloudinary  │         │
│  │  (Database) │  │  (Vectors)  │  │  (Files)    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
Resume Project/
├── backend/
│   ├── authentication/     # User registration, login, roles
│   ├── resumes/           # Resume upload & text extraction
│   ├── jobs/              # Job CRUD, candidates, Excel export
│   ├── evaluations/       # AI evaluation, applications, status
│   ├── llm_services.py    # OpenAI + Embedding services
│   ├── llm_config.py      # API keys & settings
│   └── manage.py
│
├── resume-checker-frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/          # Login, Register forms
│   │   │   ├── resume/        # ResumeUpload, ResumeList
│   │   │   ├── jobs/          # JobForm, JobList
│   │   │   └── evaluations/   # EvaluationCard, EvaluationList
│   │   ├── pages/
│   │   │   ├── Dashboard.js   # Role-based dashboard
│   │   │   ├── ResumesPage.jsx
│   │   │   ├── JobsPage.jsx
│   │   │   └── EvaluationsPage.jsx
│   │   ├── services/          # API service layer
│   │   ├── context/           # AuthContext
│   │   └── utils/             # Helpers, PDF generator
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- OpenAI API Key

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo OPENAI_API_KEY=your_openai_key > .env
echo SECRET_KEY=your_django_secret >> .env

# Run migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### Frontend Setup

```bash
# Navigate to frontend
cd resume-checker-frontend

# Install dependencies
npm install

# Start development server
npm start
```

### Access the Application
- 🌐 **Frontend**: http://localhost:3000
- 🔧 **API**: http://localhost:8000/api/
- 👤 **Admin**: http://localhost:8000/admin/

---

## 🔧 Environment Variables

### Backend (.env)
```env
SECRET_KEY=your_django_secret_key
DEBUG=True
OPENAI_API_KEY=your_openai_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

---

## 📝 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | User registration |
| POST | `/api/auth/login/` | User login |
| GET | `/api/auth/profile/` | Get user profile |

### Resumes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resumes/` | List resumes |
| POST | `/api/resumes/` | Upload resume |
| GET | `/api/resumes/{id}/` | Get resume details |
| DELETE | `/api/resumes/{id}/` | Delete resume |
| GET | `/api/resumes/{id}/download/` | Download resume file |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs/` | List all active jobs |
| POST | `/api/jobs/` | Create job (Placement Team) |
| GET | `/api/jobs/{id}/` | Get job details |
| PATCH | `/api/jobs/{id}/` | Update job |
| DELETE | `/api/jobs/{id}/` | Delete job |
| GET | `/api/jobs/{id}/candidates/` | Get matched candidates |
| GET | `/api/jobs/{id}/export/` | Export to Excel |

### Evaluations & Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/evaluations/` | List evaluations |
| POST | `/api/evaluations/` | Create evaluation |
| GET | `/api/evaluations/{id}/` | Get evaluation details |
| GET | `/api/evaluations/applications/` | Get my applications (Student) |
| POST | `/api/evaluations/applications/apply/` | Apply to job |
| GET | `/api/evaluations/applications/check/{job_id}/` | Check if applied |
| PATCH | `/api/evaluations/applications/{id}/update/` | Update status (Placement) |

---

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **Student** | Upload resume, Browse jobs, Apply to jobs, View own evaluations, Track applications |
| **Placement Team** | Create jobs, View all resumes, View all evaluations, Shortlist candidates, Export reports |
| **Admin** | Full access to all features |

---

## 🔄 Application Flow

### Student Flow
```
Register → Login → Upload Resume → Browse Jobs → Apply to Job
                                        ↓
                              Auto-Evaluation Triggered
                                        ↓
                              View Score & Feedback
                                        ↓
                              Track Application Status
```

### Placement Team Flow
```
Login → Create Job Posting → Students Apply
                                   ↓
                        View Matched Candidates
                                   ↓
                        Sort by Score → Shortlist
                                   ↓
                        Export to Excel / Update Status
```

---

## 🚀 Deployment

Currently deployed on:
- **Backend**: Render
- **Frontend**: Render  
- **File Storage**: Cloudinary
- **Database**: SQLite (can migrate to PostgreSQL)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/NewFeature`)
3. Commit changes (`git commit -m 'Add NewFeature'`)
4. Push to branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **OpenAI** - GPT API for intelligent analysis
- **Sentence Transformers** - Text embeddings
- **Material UI** - Beautiful React components
- **Django REST Framework** - Robust API development

---

⭐ **Star this repo if you found it helpful!** ⭐
