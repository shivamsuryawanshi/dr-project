# AI assisted development

# MedExJob.com - Medical Job Portal

## 📖 Project Overview

MedExJob.com एक comprehensive medical job portal है जो healthcare professionals और employers को connect करता है।

## 🏗️ Project Structure

```
MedExJobUpdated/
├── backend/          # Spring Boot Backend API (Java)
├── frontend/         # React + TypeScript Frontend (Vite)
├── deployment/       # Deployment scripts और guides
└── README.md         # यह file
```

## 🚀 Quick Start (Local Development)

### Option 1: Quick Start Script (Recommended)

**Windows:**

```powershell
.\start-local.ps1
```

**Linux/Mac:**

```bash
chmod +x start-local.sh
./start-local.sh
```

### Option 2: Manual Setup

#### 1. Database Setup

```sql
CREATE DATABASE medtech_db;
```

#### 2. Backend Setup

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

✅ Backend: http://localhost:8081

#### 3. Frontend Setup (नई Terminal में)

```bash
cd frontend
npm install
npm run dev
```

✅ Frontend: http://localhost:5173

## 📋 Detailed Setup Guides

- **[LOCAL_SETUP.md](./LOCAL_SETUP.md)** - Complete local development guide
- **[QUICK_START.md](./QUICK_START.md)** - Quick reference guide
- **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** - Setup checklist

## 🛠️ Tech Stack

### Backend

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Security** (JWT Authentication)
- **Spring Data JPA**
- **MySQL 8.0**
- **Maven**

### Frontend

- **React 18**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Radix UI**
- **React Router**

## 📁 Important Files

### Backend Configuration

- `backend/src/main/resources/application.yml` - Main configuration
- `backend/pom.xml` - Maven dependencies

### Frontend Configuration

- `frontend/vite.config.ts` - Vite configuration
- `frontend/package.json` - npm dependencies

## 🔧 Configuration

### Database

- **Database Name**: `medtech_db`
- **Port**: 3306 (MySQL default)
- **Credentials**: `backend/src/main/resources/application.yml` में update करें

### Ports

- **Backend**: 8081
- **Frontend**: 5173
- **MySQL**: 3306

## ✅ Verification

### Backend Health Check

```
http://localhost:8081/api/actuator/health
```

Expected: `{"status":"UP"}`

### Frontend

```
http://localhost:5173
```

Expected: Homepage loads successfully

## 🐛 Troubleshooting

Common issues और solutions के लिए **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** देखें।

## 📦 Production Build

### Backend

```bash
cd backend
mvn clean package
# JAR: target/medexjob-backend-1.0.0.jar
```

### Frontend

```bash
cd frontend
npm run build
# Build files: dist/
```

## 🚀 Deployment

Hostinger पर deploy करने के लिए `deployment/` folder देखें।

## 📝 Development Workflow

1. **Local Development**: इस guide का follow करें
2. **Testing**: सभी features locally test करें
3. **Production Build**: Build commands use करें
4. **Deployment**: `deployment/` folder में guides follow करें

## 🔐 Security Notes

- JWT secret production में change करें
- Database credentials secure रखें
- Environment variables use करें production के लिए

## 📞 Support

Issues के लिए:

1. Logs check करें: `backend/logs/medexjob.log`
2. Browser console check करें (F12)
3. Backend terminal में errors देखें

## 📄 License

This project is licensed under the MIT License.

---

**Happy Coding! 🎉**
