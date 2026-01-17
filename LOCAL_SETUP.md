# AI assisted development

# MedExJob - Local Development Setup Guide

## 📋 आवश्यकताएं (Prerequisites)

### 1. Software Installation

- **Java 17** या उससे ऊपर
- **Maven 3.6+**
- **MySQL 8.0+**
- **Node.js 18+** और **npm**
- **Git**

### 2. Database Setup

#### MySQL Database बनाएं:

```sql
CREATE DATABASE medtech_db;
USE medtech_db;
```

#### Database Credentials Update करें:

`backend/src/main/resources/application.yml` में अपना MySQL username और password डालें:

```yaml
spring:
  datasource:
    username: root # अपना MySQL username
    password: shivam123 # अपना MySQL password
```

## 🚀 Local Development Setup

### Step 1: Backend Setup

#### 1.1 Backend Directory में जाएं:

```bash
cd MedExJobUpdated/backend
```

#### 1.2 Dependencies Install करें:

```bash
mvn clean install
```

#### 1.3 Application Run करें:

```bash
mvn spring-boot:run
```

Backend `http://localhost:8081` पर चलेगा।

**Note:** पहली बार run करने पर database tables automatically create हो जाएंगी।

### Step 2: Frontend Setup

#### 2.1 नई Terminal खोलें और Frontend Directory में जाएं:

```bash
cd MedExJobUpdated/frontend
```

#### 2.2 Dependencies Install करें:

```bash
npm install
```

#### 2.3 Development Server Start करें:

```bash
npm run dev
```

Frontend `http://localhost:5173` पर चलेगा।

## ✅ Verification

### Backend Check:

- Browser में जाएं: `http://localhost:8081/api/actuator/health`
- यदि `{"status":"UP"}` दिखे तो backend सही चल रहा है।

### Frontend Check:

- Browser में जाएं: `http://localhost:5173`
- Homepage load होना चाहिए।

## 🔧 Configuration Files

### Backend Configuration

- **File**: `backend/src/main/resources/application.yml`
- **Port**: 8081
- **Database**: medtech_db
- **JWT Secret**: Already configured

### Frontend Configuration

- **File**: `frontend/vite.config.ts`
- **Port**: 5173 (default)
- **API Proxy**: `/api` → `http://localhost:8081`

## 📝 Important Notes

1. **Database**: MySQL server चलना चाहिए
2. **Ports**:
   - Backend: 8081
   - Frontend: 5173
3. **CORS**: Already configured for localhost
4. **File Uploads**: `backend/uploads/` folder में save होंगे

## 🐛 Troubleshooting

### Backend Issues:

- **Port already in use**: किसी और application को port 8081 use कर रहा है
- **Database connection error**: MySQL server check करें और credentials verify करें
- **Maven build fails**: Java version check करें (Java 17 required)

### Frontend Issues:

- **npm install fails**: Node.js version check करें (18+ required)
- **API calls fail**: Backend running है या नहीं check करें
- **Port conflict**: किसी और application को port 5173 use कर रहा है

## 🚀 Quick Start Commands

### Terminal 1 (Backend):

```bash
cd MedExJobUpdated/backend
mvn spring-boot:run
```

### Terminal 2 (Frontend):

```bash
cd MedExJobUpdated/frontend
npm run dev
```

## 📦 Production Build

### Backend Build:

```bash
cd MedExJobUpdated/backend
mvn clean package
# JAR file: target/medexjob-backend-1.0.0.jar
```

### Frontend Build:

```bash
cd MedExJobUpdated/frontend
npm run build
# Build files: dist/
```

## 🔐 Default Admin User

Application start होने पर automatically admin user create हो सकता है।
`backend/src/main/java/com/medexjob/config/DataSeeder.java` check करें।

## 📞 Support

किसी भी issue के लिए:

1. Logs check करें: `backend/logs/medexjob.log`
2. Browser console check करें (F12)
3. Backend terminal में errors देखें
