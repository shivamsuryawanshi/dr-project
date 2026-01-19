# AI assisted development

# Docker Setup Guide - MedExJob.com

यह guide Docker और Docker Compose का उपयोग करके MedExJob.com application को run करने के लिए है।

## 📋 Prerequisites

- Docker (version 20.10+)
- Docker Compose (version 2.0+)

## 🚀 Quick Start

### 1. Environment Variables Setup

`.env.example` file को copy करें और `.env` file बनाएं:

```bash
cp .env.example .env
```

`.env` file में अपनी configuration values update करें:

```env
DB_ROOT_PASSWORD=your-secure-password
DB_NAME=medtech_db
DB_USERNAME=medexjob
DB_PASSWORD=your-db-password

# Email और Razorpay keys भी configure करें
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=your-app-password
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret
```

### 2. Build और Run

सभी services को build और start करने के लिए:

```bash
docker-compose up -d --build
```

### 3. Services Access

- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:8081
- **Backend Health Check**: http://localhost:8081/api/actuator/health
- **MySQL**: localhost:3306

## 📦 Docker Services

### MySQL Database
- **Container**: `medexjob-mysql`
- **Port**: 3306
- **Database**: `medtech_db`
- **Volume**: `mysql_data` (persistent storage)

### Backend (Spring Boot)
- **Container**: `medexjob-backend`
- **Port**: 8081
- **Build**: Multi-stage Maven build
- **Volume**: `backend_uploads` (file uploads)

### Frontend (React + Nginx)
- **Container**: `medexjob-frontend`
- **Port**: 80
- **Build**: Multi-stage Node.js build with Nginx

## 🛠️ Useful Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### Rebuild Services
```bash
# Rebuild all
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build backend
docker-compose up -d --build frontend
```

### Access Container Shell
```bash
# Backend
docker exec -it medexjob-backend sh

# Frontend
docker exec -it medexjob-frontend sh

# MySQL
docker exec -it medexjob-mysql mysql -u medexjob -p medtech_db
```

### Clean Up
```bash
# Stop and remove containers
docker-compose down

# Remove volumes (⚠️ deletes database data)
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

## 🔧 Configuration

### Environment Variables

सभी configuration `.env` file में define की जा सकती है:

- **Database**: `DB_*` variables
- **Backend**: `SPRING_*`, `JWT_*`, `RAZORPAY_*` variables
- **Ports**: `BACKEND_PORT`, `FRONTEND_PORT`, `DB_PORT`

### Backend Configuration

Backend `application-prod.yml` file use करता है जो environment variables से values लेता है।

### Frontend Configuration

Frontend build time पर configured होता है। Production में API base URL update करने के लिए:

1. `frontend/src/api/apiClient.ts` में `API_BASE` update करें
2. Rebuild करें: `docker-compose up -d --build frontend`

या environment variable use करें:

```dockerfile
# frontend/Dockerfile में
ARG VITE_API_BASE
ENV VITE_API_BASE=${VITE_API_BASE}
```

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# MySQL logs check करें
docker-compose logs mysql

# MySQL container में connect करें
docker exec -it medexjob-mysql mysql -u root -p
```

### Backend Not Starting

```bash
# Backend logs check करें
docker-compose logs backend

# Health check करें
curl http://localhost:8081/api/actuator/health
```

### Frontend Not Loading

```bash
# Frontend logs check करें
docker-compose logs frontend

# Nginx configuration check करें
docker exec -it medexjob-frontend cat /etc/nginx/conf.d/default.conf
```

### Port Already in Use

अगर ports already in use हैं, `.env` file में ports change करें:

```env
BACKEND_PORT=8082
FRONTEND_PORT=8080
DB_PORT=3307
```

## 📝 Development Workflow

### Local Development with Docker

1. Code changes करें
2. Rebuild करें: `docker-compose up -d --build`
3. Logs check करें: `docker-compose logs -f`

### Database Migrations

Database schema automatically update होता है (`ddl-auto: update`). Production में `validate` या `none` use करें।

### File Uploads

Uploaded files `backend_uploads` volume में store होते हैं। Data persist रहता है even after container restart।

## 🔒 Security Notes

1. **Production में**:
   - `.env` file में strong passwords use करें
   - JWT secret change करें
   - CORS origins restrict करें
   - Database credentials secure रखें

2. **Secrets Management**:
   - Production में Docker secrets या external secret management use करें
   - `.env` file को git में commit न करें

## 📊 Health Checks

सभी services में health checks configured हैं:

- **MySQL**: `mysqladmin ping`
- **Backend**: `/api/actuator/health`
- **Frontend**: `/health`

Health status check करें:

```bash
docker-compose ps
```

## 🚀 Production Deployment

Production deployment के लिए:

1. `.env` file में production values set करें
2. `docker-compose.yml` में resource limits add करें
3. Reverse proxy (Nginx/Traefik) setup करें
4. SSL certificates configure करें
5. Monitoring और logging setup करें

## 📞 Support

Issues के लिए:
- Docker logs check करें
- Container status verify करें
- Network connectivity test करें

---

**Happy Dockerizing! 🐳**

