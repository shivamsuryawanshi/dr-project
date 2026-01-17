# AI assisted development

# ✅ Local Setup Checklist

## 📋 Pre-requisites Check

- [ ] **Java 17+** installed
  ```bash
  java -version
  ```

- [ ] **Maven 3.6+** installed
  ```bash
  mvn -version
  ```

- [ ] **MySQL 8.0+** installed and running
  ```bash
  # Check MySQL service
  # Windows: Check Services
  # Linux/Mac: sudo systemctl status mysql
  ```

- [ ] **Node.js 18+** installed
  ```bash
  node --version
  npm --version
  ```

## 🗄️ Database Setup

- [ ] MySQL server running
- [ ] Database `medtech_db` created
  ```sql
  CREATE DATABASE medtech_db;
  ```
- [ ] Database credentials updated in `backend/src/main/resources/application.yml`
  - Username: `root` (या अपना username)
  - Password: `shivam123` (या अपना password)

## 🔧 Backend Setup

- [ ] Navigate to backend directory
  ```bash
  cd MedExJobUpdated/backend
  ```

- [ ] Install dependencies
  ```bash
  mvn clean install
  ```

- [ ] Start backend server
  ```bash
  mvn spring-boot:run
  ```

- [ ] Verify backend is running
  - Open: http://localhost:8081/api/actuator/health
  - Should show: `{"status":"UP"}`

## 🎨 Frontend Setup

- [ ] Navigate to frontend directory (नई terminal में)
  ```bash
  cd MedExJobUpdated/frontend
  ```

- [ ] Install dependencies
  ```bash
  npm install
  ```

- [ ] Start frontend server
  ```bash
  npm run dev
  ```

- [ ] Verify frontend is running
  - Open: http://localhost:5173
  - Should show homepage

## ✅ Final Verification

- [ ] Backend API accessible: http://localhost:8081/api/actuator/health
- [ ] Frontend accessible: http://localhost:5173
- [ ] No console errors in browser
- [ ] No errors in backend terminal
- [ ] Database tables created automatically

## 🐛 Common Issues & Solutions

### Issue: Port 8081 already in use
**Solution**: 
- Check what's using port 8081: `netstat -ano | findstr :8081` (Windows)
- Kill the process or change port in `application.yml`

### Issue: MySQL connection failed
**Solution**:
- Verify MySQL is running
- Check username/password in `application.yml`
- Verify database `medtech_db` exists

### Issue: npm install fails
**Solution**:
- Clear cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

### Issue: Maven build fails
**Solution**:
- Check Java version: `java -version` (should be 17+)
- Clear Maven cache: `mvn clean`
- Try: `mvn clean install -U`

## 🚀 Quick Start Scripts

### Windows (PowerShell):
```powershell
.\start-local.ps1
```

### Linux/Mac (Bash):
```bash
chmod +x start-local.sh
./start-local.sh
```

## 📝 Next Steps

Once local setup is complete:
1. Test all features locally
2. Fix any bugs
3. Prepare for Hostinger deployment
4. Check `deployment/` folder for deployment guides

