# MedExJob.com Backend - Spring Boot API

## 🚀 Overview
This is the backend API for MedExJob.com - a comprehensive medical job portal built with Spring Boot, MySQL, and JWT authentication.

## 🛠️ Tech Stack
- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Security** with JWT
- **Spring Data JPA**
- **MySQL 8.0**
- **Maven**

## 📋 Prerequisites
- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+
- IDE (IntelliJ IDEA, Eclipse, VS Code)

## 🗄️ Database Setup

### 1. Create Database
```sql
CREATE DATABASE medtech_db;
USE medtech_db;
```

### 2. Update Configuration
Edit `src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/medtech_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: your_mysql_username
    password: your_mysql_password
```

### 3. JWT Secret
Update the JWT secret in `application.yml`:
```yaml
jwt:
  secret: your_super_secret_jwt_key_here_make_it_very_long_and_secure
```

## 🚀 Running the Application

### 1. Clone and Navigate
```bash
cd backend-java
```

### 2. Install Dependencies
```bash
mvn clean install
```

### 3. Run Application
```bash
mvn spring-boot:run
```

The API will be available at: `http://localhost:8080/api`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/auth/verify-email` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Health Check
- `GET /api/actuator/health` - Application health status

## 🔐 Authentication Flow

### 1. Register User
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "role": "CANDIDATE"
}
```

### 2. Login
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

### 3. Use Token
Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 🏗️ Project Structure
```
src/main/java/com/medexjob/
├── MedexjobBackendApplication.java
├── controller/          # REST Controllers
├── service/            # Business Logic
├── repository/         # Data Access Layer
├── entity/            # JPA Entities
├── dto/               # Data Transfer Objects
├── security/          # Security Configuration
└── config/            # Configuration Classes
```

## 🗃️ Database Tables
The application will automatically create the following tables:
- `users` - User accounts
- `employers` - Employer profiles
- `candidates` - Candidate profiles
- `jobs` - Job postings
- `applications` - Job applications
- `subscriptions` - Employer subscriptions
- `notifications` - User notifications

## 🔧 Configuration

### Application Properties
- **Server Port**: 8080
- **Database**: MySQL (medtech_db)
- **JWT Expiration**: 7 days
- **File Upload**: 10MB max
- **CORS**: Enabled for localhost:3000

### Environment Variables
You can override configuration using environment variables:
- `DB_HOST` - Database host
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret

## 🧪 Testing
```bash
# Run tests
mvn test

# Run with coverage
mvn test jacoco:report
```

## 📦 Building for Production
```bash
# Create JAR file
mvn clean package

# Run JAR
java -jar target/medexjob-backend-1.0.0.jar
```

## 🔍 Monitoring
- **Health Check**: `http://localhost:8080/api/actuator/health`
- **Metrics**: `http://localhost:8080/api/actuator/metrics`
- **Logs**: Check `logs/medexjob.log`

## 🚀 Next Steps
1. **Complete Entity Models** - Add remaining entities (Candidate, Application, etc.)
2. **Implement Services** - Add business logic for all features
3. **Create Controllers** - Add REST endpoints for all operations
4. **Add File Upload** - Implement document and CV upload
5. **Email Service** - Add email notifications
6. **Payment Integration** - Add Razorpay integration
7. **Testing** - Add comprehensive unit and integration tests

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License
This project is licensed under the MIT License.










