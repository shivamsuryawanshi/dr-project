# MedExJob - Developer Handover & Architecture Notes

Hey! Welcome to the codebase. This document covers everything you need to get up to speed without spending three days digging through the code. It explains how things are wired, how the data flows, the trickier parts of the domain (especially circular parsing), and the gotchas you'll run into.

---

## 1. Quick TL;DR of What This Project Is

MedExJob (`medexjob.com`) is a niche job portal built specifically for the Indian medical / healthcare sector (Doctors, Residents, Faculty, Specialists, Paramedical staff).

Unlike general job portals (Naukri, Indeed), medical hiring has two distinct worlds:
1. **Private Jobs:** Standard hospital / clinic postings (Walk-ins, Full-time, Consultant) created directly by employers.
2. **Government Circulars / Recruitments:** Official PDF notifications released by AIIMS, PGIMER, State Health Departments, ESIC, etc. These are usually 5–30 page documents containing complex multi-department vacancy tables (e.g. 20 departments, each with UR/OBC/SC/ST/EWS reservation breakdowns, recurring walk-in dates, and specific eligibility criteria).

We have an automated extraction pipeline (using Apache PDFBox + Tesseract OCR + Google Gemini) that parses these massive circulars, extracts individual department vacancies, and publishes them as browsable jobs.

---

## 2. Tech Stack Overview

### Backend
- **Language / Runtime:** Java 17
- **Framework:** Spring Boot 3.2.0 (Maven build)
- **Database:** MySQL 8.0 (`medtech_db`)
- **ORM:** Spring Data JPA / Hibernate (`ddl-auto: update`)
- **Security:** Spring Security + JWT (HS512, 7-day expiration)
- **PDF & AI Processing:** Apache PDFBox 3.x, Tesseract OCR (`medex.ocr`), Google Gemini API (`gemini-2.0-flash` via OpenAI-compatible endpoint)
- **Payment Gateway:** Razorpay SDK (currently test keys)
- **Email:** Spring Mail (Gmail SMTP on port 587)
- **Default Port:** `8081`

### Frontend
- **Framework:** React 18 + TypeScript
- **Bundler:** Vite 5 (uses `@vitejs/plugin-react-swc`)
- **UI & Styling:** Tailwind CSS + Radix UI primitives + Lucide Icons + Sonner (toasts)
- **Routing:** React Router v7 (`react-router-dom`)
- **Charts / Animations:** Recharts, Framer Motion
- **API Client:** Axios with JWT request interceptor & 401 handler
- **Default Port:** `5173` (proxies `/api` -> `http://127.0.0.1:8081`)

---

## 3. Local Development Setup

### Prerequisites
- Java 17 JDK (`java -version`)
- Node.js 18+ & npm (`node -v`)
- MySQL 8.0 running locally on port 3306
- Maven 3.8+ (optional if you use wrapper, but `mvn` in PATH is recommended)
- *(Optional for OCR testing)*: `tesseract-ocr` installed and added to system PATH.

### Step 1: Database Setup
Open your local MySQL shell and run:
```sql
CREATE DATABASE medtech_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Check `backend/src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/medtech_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD:shivam123} # Change this to your local MySQL password or set DB_PASSWORD env var
```

### Step 2: Running Backend
```bash
cd backend
mvn clean install -DskipTests
mvn spring-boot:run
```
Backend will start on: **`http://localhost:8081`**  
Health check: `http://localhost:8081/api/actuator/health` -> `{"status":"UP"}`

### Step 3: Running Frontend
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend will start on: **`http://localhost:5173`**

> **Note on Vite Proxy:** You do NOT need to configure CORS for local dev. `frontend/vite.config.ts` proxies every `/api/*` call directly to `http://127.0.0.1:8081`.

### Shortcut Script
If you're on Windows PowerShell, you can just run:
```powershell
.\start-local.ps1
```
This checks MySQL, verifies Java/Node versions, and opens both backend and frontend in separate terminals.

---

## 4. Architecture & Key Directory Map

```
dr-project-main/
├── backend/
│   ├── src/main/java/com/medexjob/
│   │   ├── config/              # DataSeeder, CorsConfig, Swagger/WebMvc configs
│   │   ├── controller/          # REST endpoints (auth, jobs, recruitments, applications, admin)
│   │   ├── dto/                 # Request/Response DTOs & recruitment extraction structures
│   │   ├── entity/              # JPA models (User, Job, Recruitment, VacancyRecord, Application, etc.)
│   │   ├── repository/          # Spring Data JPA repositories & specifications
│   │   ├── security/            # JWT Token provider, JwtRequestFilter, SecurityConfig
│   │   ├── service/             # Core business logic (see breakdown below)
│   │   └── util/                # AdminUserCreator bootstrap, helper utilities
│   └── src/main/resources/
│       └── application.yml      # Base configuration for database, JWT, AI, Razorpay, mail
│
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios clients split by domain (jobs, recruitments, auth, etc.)
│   │   ├── components/          # React page components and admin consoles
│   │   │   ├── ui/              # Reusable Radix UI atomic components
│   │   │   ├── HomePage.tsx     # Landing page with hero search and 4-row category layout
│   │   │   ├── JobListingPage.tsx # All Jobs / Govt / Private search & multi-filter page
│   │   │   ├── SectorAwareJobDetailPage.tsx # Smart renderer for Govt circulars vs Private jobs
│   │   │   ├── AiBulkJobUploader.tsx # Admin AI PDF circular extraction workspace
│   │   │   └── ...
│   │   ├── contexts/            # AuthContext (JWT, user state, impersonation)
│   │   ├── types/               # TypeScript interfaces & domain enums
│   │   └── utils/               # Notice parsers, table breakdown calculators, scroll helpers
│   └── vite.config.ts           # Dev proxy config
│
├── deployment/                  # Nginx configs, systemd unit files, deployment scripts
├── docker-compose.yml           # Full-stack containerized configuration
└── uploads/                     # Local storage directory for circular PDFs & candidate resumes
```

---

## 5. Core Domain Concepts & Data Flow

### 1. User Roles & Access Control
There are 3 primary roles in `User.java`:
- `ADMIN`: Has complete access to job moderation, user banning, employer verification, AI bulk circular uploading, pricing management, and analytics. Admins can also **impersonate** any employer using the impersonation banner (`ImpersonationBanner.tsx`).
- `EMPLOYER`: Represents a hospital, clinic, medical college, or healthcare recruiter. Must be verified before posting live jobs. Can purchase subscription plans via Razorpay.
- `CANDIDATE`: Doctors, medical students, nurses, specialists. Can search, save jobs, set email alerts, upload CVs, and apply.

### 2. The Two Job Types
In `Job.java`, the `sector` column determines how the job behaves:
- `government`: Usually contains an official PDF URL, walk-in interview dates, multi-department breakdown, application links, and official source information.
- `private`: Direct recruiter postings with standard salary ranges, application buttons, and employer dashboard tracking.

### 3. The AI Circular Extraction Pipeline (Crucial!)
This is the core intellectual property of the platform. Don't touch this without understanding this flow:

```
[Official Circular PDF (e.g. AIIMS Delhi 30 pages)]
                     │
                     ▼
  Admin uploads in `AiBulkJobUploader.tsx`
                     │
                     ▼ (POST /api/admin/recruitments/extract-gemini)
  `BulkGeminiRecruitmentExtractionService.java`
                     │
  ├── 1. Generate SHA-256 fingerprint of file (cache/duplicate check)
  ├── 2. Extract native text via Apache PDFBox
  ├── 3. If native text < 250 chars (scanned doc) -> Trigger `RecruitmentOcrService` (Tesseract)
  ├── 4. Send PDF bytes + extracted text to Gemini API (`gemini-2.0-flash`)
  │      Prompt instructs Gemini to extract:
  │      - Organisation name, Advt No., sector
  │      - Multi-department vacancy table (Discipline, UR, OBC, SC, ST, EWS, Total)
  │      - Cadres (SR, JR, Assistant Professor, MO, GDMO)
  │      - Recurring walk-in dates, last date, venue, fees, official PDF URL
  └── 5. If Gemini is down -> Fall back to heuristic table regex parser (`RecruitmentExtractionService.java`)
                     │
                     ▼
  Admin reviews preview in UI (`AiBulkJobUploader.tsx`)
                     │
                     ▼ (POST /api/admin/recruitments/publish)
  `VacancyJobPublisher.java`
  - Creates parent `Recruitment` record
  - Creates child `VacancyRecord` items
  - Generates searchable candidate-facing `Job` entries for each department or consolidated cadre
```

---

## 6. Where Do I Look If I Need To...

| Task | Where to go |
|---|---|
| **Fix/Tweak Circular Table Parsing** | `frontend/src/utils/recruitmentBreakdown.ts`, `frontend/src/utils/rawNoticeParser.ts`, `backend/src/service/BulkGeminiRecruitmentExtractionService.java` |
| **Adjust Job Search / Filters / Cadres** | `frontend/src/components/JobListingPage.tsx`, `frontend/src/components/FilterSidebar.tsx`, `backend/src/repository/JobSpecifications.java` |
| **Change Home Page Layout / Rows** | `frontend/src/components/HomePage.tsx` (e.g. row limits, category cards) |
| **Modify Job Detail Page Layout** | `frontend/src/components/SectorAwareJobDetailPage.tsx` & `JobDetailPage.tsx` |
| **Adjust Auth / Tokens / Login** | `backend/src/security/JwtTokenProvider.java`, `frontend/src/contexts/AuthContext.tsx`, `frontend/src/api/apiClient.ts` |
| **Change File Upload / Storage Location** | `backend/src/service/FileUploadService.java`, `backend/src/main/resources/application.yml` (`file:` and `ftp:`) |
| **Razorpay / Payment Webhooks** | `backend/src/controller/PaymentWebhookController.java`, `backend/src/service/RazorpayService.java` |
| **Admin Controls & Impersonation** | `frontend/src/components/AdminDashboard.tsx`, `AdminUsersPage.tsx`, `ImpersonationBanner.tsx` |

---

## 7. Gotchas & Landmines (Read Before Coding!)

### 1. Right-to-Left Table Column Scanning in Circulars
Healthcare circular tables vary wildly. A typical row looks like:
`| Biochemistry | 3 | 1 | 2 | 0 | 1 | 7 |`
Here `3` is UR, `1` is OBC... and `7` is the actual Total.
**Never parse left-to-right to find total vacancies!** The first integer is almost always the Unreserved (UR) category count. The parsing utilities (`recruitmentBreakdown.ts` and `rawNoticeParser.ts`) use column header detection first, and fallback to scanning rightmost-to-left for the total count or summing category columns. Keep this intact or total vacancies will be wrongly reported.

### 2. False "Medical Officer" Role Tagging
In India, many circulars mention "Medical Officer" in administrative footnotes or committee names even when the actual posts are for "Senior Resident" or "Assistant Professor". We recently added strict regex filters in `recruitmentBreakdown.ts` and `JobSpecifications.java` to prevent circulars from being falsely tagged as Medical Officer jobs. Be careful when editing cadre regexes.

### 3. Scroll Restoration on Route Transitions
`react-router` by default leaves the window scroll position where it was when you change routes. We implemented `frontend/src/utils/scrollHelper.ts` to solve this:
- When navigating from a search result into a Job Detail page and back, the search scroll position is preserved via `sessionStorage`.
- When navigating anywhere else, it forces an instant jump to `{ top: 0, left: 0 }`. If you add new routes in `App.tsx`, make sure they respect this helper.

### 4. File Uploads in Dev vs Production
In `application.yml`:
- `file.use-ftp: false` (Default for local dev): Files are saved to the local folder `./uploads/` and served via `FileServingController.java`.
- In production, files can either be uploaded via FTP to Hostinger storage or stored on the VPS disk under `/var/www/medexjob/uploads/` which Nginx directly serves via `location /uploads/`.

### 5. Hibernate `ddl-auto: update`
We are currently using `hibernate.ddl-auto: update`.
- It automatically creates new tables and adds new columns when you add fields to JPA entities.
- **Warning:** It does **NOT** drop columns, rename columns, or fix data type incompatibilities. If you rename an entity attribute, Hibernate will create a brand new column and leave the old one intact with orphaned data. For major schema changes on production, write explicit SQL migration scripts.

### 6. Admin Account Bootstrap
If you drop your local database and need an admin account:
In `backend/src/main/resources/application.yml` (or via environment variables), `AdminUserCreator` can seed an admin account:
```yaml
medex:
  admin-bootstrap:
    enabled: true
    name: "System Admin"
    email: "admin@medexjob.com"
    phone: "9999999999"
    password: "AdminPassword123"
```
Once created, set `enabled: false`.

---

## 8. Production Deployment & Hosting

### Server Details
- **Hosting:** Hostinger VPS (Ubuntu)
- **Domain:** `https://medexjob.com` and `https://www.medexjob.com`
- **Reverse Proxy:** Nginx (config located at `deployment/nginx-config.conf`)
- **Backend Process:** Systemd service `medexjob-backend.service` running the packaged Spring Boot `.jar` on port 8081
- **Frontend Assets:** Static build files (`npm run build`) served directly by Nginx from `/var/www/medexjob`
- **SSL:** Let's Encrypt Certbot auto-renewing

### Deployment Procedure

#### Deploying Backend
```bash
# On your local machine or CI:
cd backend
mvn clean package -DskipTests
# Upload target/medexjob-backend-1.0.0.jar to the VPS:
scp target/medexjob-backend-1.0.0.jar root@82.180.143.101:/opt/medexjob/backend/

# On the VPS:
sudo systemctl restart medexjob-backend
sudo systemctl status medexjob-backend
# Check logs:
journalctl -u medexjob-backend -n 100 -f
```

#### Deploying Frontend
```bash
# Locally:
cd frontend
npm run build
# Upload dist contents to VPS:
scp -r dist/* root@82.180.143.101:/var/www/medexjob/

# On VPS, ensure correct permissions:
sudo chown -R www-data:www-data /var/www/medexjob
sudo chmod -R 755 /var/www/medexjob
```

There is also a helper bash script in `deployment/deploy.sh` that automates these checks on the VPS.

---

## 9. Current Status & Recommended Next Steps

1. **Gemini API Key in Production:** Ensure `MEDEX_AI_API_KEY` is set in the VPS systemd environment variables (`/etc/systemd/system/medexjob-backend.service.d/override.conf`) so circular extractions run on Gemini 2.0 Flash.
2. **Razorpay Live Activation:** Once the merchant KYC is completed, replace `razorpay.key-id` and `razorpay.key-secret` with production keys and verify the webhook secret.
3. **Automated WhatsApp / Email Alerts:** The notification tables (`JobAlert`, `NotificationPreferences`) are built; the cron job to send daily matching digests is ready to be expanded.
4. **Circular Auto-Fetcher (Future Roadmap):** Currently admins upload PDFs through `AiBulkJobUploader.tsx`. A planned crawler can scrape major hospital recruitment pages (AIIMS, PGI, etc.) and drop PDFs into the staging queue automatically.

---

*If you hit an issue or something doesn't make sense, check `backend/logs/medexjob.log` or check browser DevTools console — the Axios client outputs clean error objects.*
