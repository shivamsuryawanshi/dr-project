# AI assisted development

# MedExJob.com - Complete Project Overview

## 📋 Project Summary

**MedExJob.com** एक comprehensive medical job portal है जो healthcare professionals और employers को connect करता है। यह project **Spring Boot Backend** और **React + TypeScript Frontend** पर बना है।

---

## 🏗️ Architecture Overview

### Backend (Java Spring Boot)
- **Port**: 8081
- **Framework**: Spring Boot 3.2.0
- **Java Version**: 17
- **Database**: MySQL 8.0 (medtech_db)
- **Security**: Spring Security + JWT Authentication
- **Build Tool**: Maven

### Frontend (React + TypeScript)
- **Port**: 5173 (Vite dev server)
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Radix UI + Tailwind CSS
- **Routing**: React Router v7

---

## 📁 Project Structure

### Backend Structure
```
backend/
├── src/main/java/com/medexjob/
│   ├── MedexjobBackendApplication.java    # Main application
│   ├── controller/                        # REST Controllers
│   │   ├── AuthController.java           # Authentication endpoints
│   │   ├── JobController.java            # Job CRUD operations
│   │   ├── ApplicationController.java    # Job applications
│   │   ├── EmployerController.java       # Employer management
│   │   ├── AdminManagementController.java # Admin operations
│   │   ├── AnalyticsController.java      # Analytics data
│   │   ├── NewsController.java           # News/Updates
│   │   └── GlobalExceptionHandler.java   # Error handling
│   ├── entity/                           # JPA Entities
│   │   ├── User.java                     # User entity (ADMIN/EMPLOYER/CANDIDATE)
│   │   ├── Job.java                      # Job postings
│   │   ├── Application.java              # Job applications
│   │   ├── Employer.java                 # Employer profiles
│   │   └── NewsUpdate.java               # News/Updates
│   ├── repository/                       # Data Access Layer
│   │   ├── UserRepository.java
│   │   ├── JobRepository.java
│   │   ├── ApplicationRepository.java
│   │   ├── EmployerRepository.java
│   │   └── NewsUpdateRepository.java
│   ├── service/                          # Business Logic
│   │   ├── AuthService.java              # Authentication logic
│   │   ├── CustomUserDetailsService.java # User details for security
│   │   ├── EmailService.java             # Email sending
│   │   └── AdminManagementService.java   # Admin operations
│   ├── security/                         # Security Configuration
│   │   ├── SecurityConfig.java           # Spring Security config
│   │   ├── JwtTokenProvider.java         # JWT token generation
│   │   ├── JwtRequestFilter.java         # JWT filter
│   │   └── JwtAuthenticationEntryPoint.java
│   ├── dto/                              # Data Transfer Objects
│   │   ├── RegisterRequest.java
│   │   ├── LoginRequest.java
│   │   ├── AuthResponse.java
│   │   └── ... (other DTOs)
│   └── config/
│       └── DataSeeder.java               # Seed data for testing
└── src/main/resources/
    └── application.yml                    # Configuration
```

### Frontend Structure
```
frontend/
├── src/
│   ├── App.tsx                           # Main app component + routing
│   ├── main.tsx                          # Entry point
│   ├── api/                              # API client functions
│   │   ├── apiClient.ts                  # Axios client setup
│   │   ├── jobs.ts                       # Job API calls
│   │   ├── applications.ts               # Application API calls
│   │   ├── employers.ts                  # Employer API calls
│   │   ├── news.ts                       # News API calls
│   │   └── analytics.ts                  # Analytics API calls
│   ├── components/                       # React Components
│   │   ├── HomePage.tsx                  # Landing page
│   │   ├── JobListingPage.tsx            # Job listings
│   │   ├── JobDetailPage.tsx             # Job details
│   │   ├── AuthPage.tsx                  # Login/Register
│   │   ├── CandidateDashboard.tsx        # Candidate dashboard
│   │   ├── EmployerDashboard.tsx         # Employer dashboard
│   │   ├── AdminDashboard.tsx            # Admin dashboard
│   │   ├── AdminJobManagementPage.tsx    # Admin job management
│   │   ├── AdminUsersPage.tsx            # Admin user management
│   │   ├── AdminApplications.tsx         # Admin application management
│   │   ├── EmployerVerification.tsx      # Employer verification
│   │   └── ui/                           # Reusable UI components (Radix UI)
│   ├── contexts/
│   │   └── AuthContext.tsx               # Authentication context
│   ├── types/
│   │   └── index.ts                      # TypeScript types
│   └── styles/
│       └── globals.css                    # Global styles
└── vite.config.ts                         # Vite configuration
```

---

## 🗄️ Database Schema

### Tables

1. **users**
   - id (UUID)
   - name, email, phone
   - role (ADMIN, EMPLOYER, CANDIDATE)
   - password_hash
   - is_verified, is_active
   - email_verification_token
   - password_reset_token, otp, otp_expires
   - created_at, updated_at

2. **employers**
   - id (UUID)
   - user_id (FK to users)
   - company_name, company_type (HOSPITAL, CONSULTANCY, HR)
   - company_description, website
   - address, city, state, pincode
   - is_verified, verification_status (PENDING, APPROVED, REJECTED)
   - verification_notes, verified_at
   - created_at, updated_at

3. **jobs**
   - id (UUID)
   - employer_id (FK to employers)
   - title, description
   - sector (GOVERNMENT, PRIVATE)
   - category (JUNIOR_RESIDENT, SENIOR_RESIDENT, etc.)
   - location, qualification, experience
   - experience_level, speciality, duty_type
   - number_of_posts, salary_range
   - requirements, benefits
   - last_date, contact_email, contact_phone
   - pdf_url, apply_link
   - status (ACTIVE, CLOSED, PENDING, DRAFT)
   - is_featured, views, applications_count
   - approved_by (FK to users), approved_at
   - created_at, updated_at

4. **applications**
   - id (UUID)
   - job_id (FK to jobs)
   - candidate_id (UUID reference)
   - candidate_name, candidate_email, candidate_phone
   - resume_url
   - status (APPLIED, SHORTLISTED, INTERVIEW, SELECTED, REJECTED)
   - notes, interview_date
   - applied_date, updated_at

5. **news_updates**
   - id (UUID)
   - title
   - type (GOVT, PRIVATE, EXAM, DEADLINE, UPDATE)
   - date, is_breaking
   - created_at

---

## 🔐 Authentication & Authorization

### User Roles
1. **ADMIN**: Full system access
2. **EMPLOYER**: Can post jobs, manage applications
3. **CANDIDATE**: Can apply for jobs, view profile

### Authentication Flow
1. **Registration**: User registers with role (CANDIDATE/EMPLOYER)
2. **Email Verification**: OTP-based (currently auto-verified for testing)
3. **Login**: JWT token generation
4. **Password Reset**: OTP-based flow
   - Request OTP → Verify OTP → Reset Password

### Security Features
- JWT token-based authentication
- Password hashing with BCrypt
- CORS configuration
- Role-based access control (RBAC)
- Protected API endpoints

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /me` - Get current user (authenticated)
- `GET /verify-email?token=...` - Email verification
- `POST /forgot-password` - Request OTP
- `POST /verify-otp` - Verify OTP
- `POST /reset-password-with-otp` - Reset password with OTP

### Jobs (`/api/jobs`)
- `GET /` - List jobs (with filters: search, sector, category, location, etc.)
- `GET /{id}` - Get job details
- `GET /meta` - Get categories and locations
- `GET /ping` - Health check
- `POST /` - Create job (public, but should be admin-only)
- `PUT /{id}` - Update job (admin only)
- `DELETE /{id}` - Delete job (admin only)

### Applications (`/api/applications`)
- `POST /` - Submit application (authenticated)
- `GET /` - List applications (admin only)
- `PUT /{id}/status` - Update application status (admin only)
- `DELETE /{id}` - Delete application (admin only)

### Employers (`/api/employers`)
- `GET /` - List employers
- `GET /{id}` - Get employer details
- `PUT /{id}/verification` - Update verification status (admin)
- `POST /{id}/documents` - Upload verification documents

### Admin (`/api/admin`)
- Various admin management endpoints

### Analytics (`/api/analytics`)
- Analytics data endpoints

### News (`/api/news`)
- News/updates endpoints

---

## 🎨 Frontend Features

### Public Pages
- **HomePage**: Landing page with featured jobs
- **Job Listing**: Browse jobs with filters
- **Job Detail**: View job details and apply
- **News Page**: Medical news and updates
- **About, FAQ, Privacy, Terms**: Static pages

### Candidate Features
- **Dashboard**: View applications, saved jobs
- **Apply for Jobs**: Submit applications with resume
- **Profile Management**: Update profile

### Employer Features
- **Verification**: Submit verification documents
- **Dashboard**: Manage jobs, view applications
- **Job Posting**: Create and manage job postings

### Admin Features
- **Dashboard**: System overview
- **Job Management**: Create, edit, delete jobs
- **User Management**: Manage all users
- **Employer Verification**: Approve/reject employers
- **Application Management**: View and manage all applications
- **News Management**: Manage news/updates
- **Analytics**: View system analytics

---

## ⚙️ Configuration

### Backend Configuration (`application.yml`)
- **Server Port**: 8081
- **Database**: MySQL (medtech_db)
- **JWT Secret**: Configured
- **CORS**: Allowed origins (localhost:5173, localhost:3000)
- **File Upload**: 10MB max, stored in `uploads/`
- **Email**: Gmail SMTP (configure credentials)

### Frontend Configuration (`vite.config.ts`)
- **Dev Server**: Port 5173
- **API Proxy**: `/api` → `http://localhost:8081`
- **Build Output**: `dist/`

---

## 🔧 Key Features

### Job Management
- ✅ Create, read, update, delete jobs
- ✅ Job filtering (sector, category, location, experience, etc.)
- ✅ Job search functionality
- ✅ Featured jobs
- ✅ Job status management (ACTIVE, CLOSED, PENDING, DRAFT)
- ✅ PDF attachments and external apply links

### Application Management
- ✅ Submit applications with resume upload
- ✅ Application status tracking
- ✅ Interview scheduling
- ✅ Admin can manage all applications

### Employer Verification
- ✅ Employer registration
- ✅ Document upload for verification
- ✅ Admin approval/rejection workflow

### User Management
- ✅ Role-based access (ADMIN, EMPLOYER, CANDIDATE)
- ✅ Email verification (OTP-based)
- ✅ Password reset (OTP-based)
- ✅ Profile management

### Analytics
- ✅ Job statistics
- ✅ Application metrics
- ✅ User analytics

---

## 🚀 Development Workflow

### Local Setup
1. **Database**: Create `medtech_db` in MySQL
2. **Backend**: 
   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```
3. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Build for Production
- **Backend**: `mvn clean package` → JAR file in `target/`
- **Frontend**: `npm run build` → Static files in `dist/`

---

## 📝 Important Notes

### Current Status
- ✅ Core functionality implemented
- ✅ Authentication working
- ✅ Job CRUD operations working
- ✅ Application submission working
- ✅ Admin dashboard functional
- ⚠️ Email service needs proper configuration
- ⚠️ Razorpay integration needs keys
- ⚠️ Some admin endpoints need proper authorization

### Security Considerations
- JWT secret should be changed in production
- Database credentials should use environment variables
- Email credentials should be secured
- File uploads should be validated and scanned
- CORS should be restricted in production

### Deployment
- Backend: Spring Boot JAR file
- Frontend: Static files (Nginx/Apache)
- Database: MySQL on server
- File Storage: Local filesystem or cloud storage

---

## 🔄 Next Steps for Development

1. **Email Service**: Configure proper email sending
2. **Payment Integration**: Complete Razorpay integration
3. **File Storage**: Consider cloud storage (S3, etc.)
4. **Testing**: Add unit and integration tests
5. **Documentation**: API documentation (Swagger/OpenAPI)
6. **Monitoring**: Add logging and monitoring
7. **Security**: Security audit and improvements
8. **Performance**: Optimize database queries
9. **UI/UX**: Enhance user experience
10. **Mobile**: Responsive design improvements

---

## 📞 Support & Documentation

- **Backend README**: `backend/README.md`
- **Frontend README**: `frontend/README.md`
- **Local Setup**: `LOCAL_SETUP.md`
- **Deployment**: `deployment/` folder

---

**Last Updated**: January 2025
**Project Status**: Active Development

