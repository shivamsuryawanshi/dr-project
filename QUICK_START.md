# AI assisted development

# Quick Start Guide - Apply Now Functionality Test

## 🚀 Start Services

### Option 1: PowerShell Script (Recommended)
```powershell
cd MedExJobUpdated
.\start-local.ps1
```

### Option 2: Manual Start

#### Terminal 1 - Backend:
```powershell
cd MedExJobUpdated\backend
mvn spring-boot:run
```

#### Terminal 2 - Frontend:
```powershell
cd MedExJobUpdated\frontend
npm install  # पहली बार ही
npm run dev
```

## ✅ Verify Services

1. **Backend**: Open `http://localhost:8081/api/actuator/health` in browser
   - Should return: `{"status":"UP"}`

2. **Frontend**: Open `http://localhost:5173` in browser
   - Should show MedExJob.com homepage

## 🧪 Test Apply Now Functionality

### Step 1: Login
- Go to `http://localhost:5173`
- Click "Login" 
- Login with candidate account

### Step 2: Navigate to Job
- Click on any job from job listing
- Job detail page will open

### Step 3: Click Apply Now
- Click "Apply Now" button
- Dialog should open
- Fill the form:
  - Name (required)
  - Email (required)
  - Phone (required)
  - Resume (optional)
  - Notes (optional)

### Step 4: Submit Application
- Click "Submit Application"
- Success message should appear
- You'll be redirected to dashboard

### Step 5: Verify in Dashboard
- Check "Applied Jobs" section
- Applied Jobs count should increase
- New job should appear in Applied Jobs list

## 🔍 Debugging

### If Dialog doesn't open:
1. Open browser console (F12)
2. Check for errors
3. Look for logs:
   - `🔘 Apply Now button clicked`
   - `🔄 Dialog onOpenChange: true`

### If Application doesn't submit:
1. Check backend logs
2. Check browser console for API errors
3. Verify backend is running on port 8081

### If Job doesn't appear in Applied Jobs:
1. Check backend logs for:
   - `✅ CandidateId set: ...`
   - `💾 Application saved with ID: ...`
2. Check browser console for:
   - `📋 Fetching applications for candidate: ...`
   - `✅ Applications fetched: X applications found`

## 📝 Expected Console Logs

### Frontend (Browser Console):
```
🔘 Apply Now button clicked (Private)
🔄 Dialog onOpenChange: true
📝 Submitting application for job: ...
✅ Application submitted successfully: ...
🔄 Redirecting to dashboard...
📥 Loading dashboard data for user: ...
📋 Fetching applications for candidate: ...
✅ Applications fetched: X applications found
```

### Backend (Terminal):
```
🔐 Authenticated user email: ...
👤 User found: ... (Role: CANDIDATE)
✅ CandidateId set: ...
💾 Application saved with ID: ..., CandidateId: ..., JobId: ...
📊 Updated job applications count: ...
🔍 Fetching applications for candidateId: ...
📋 Found X applications for candidate ...
```

## 🐛 Common Issues

### Issue 1: Frontend not starting
**Solution**: 
```powershell
cd MedExJobUpdated\frontend
npm install
npm run dev
```

### Issue 2: Backend not starting
**Solution**:
```powershell
cd MedExJobUpdated\backend
mvn clean install
mvn spring-boot:run
```

### Issue 3: Port already in use
**Solution**: 
- Backend (8081): `netstat -ano | findstr :8081` then `taskkill /F /PID <PID>`
- Frontend (5173): `netstat -ano | findstr :5173` then `taskkill /F /PID <PID>`

### Issue 4: Database connection error
**Solution**: 
- Check MySQL is running
- Verify database credentials in `application.yml`

## ✅ Success Criteria

- ✅ Dialog opens when clicking "Apply Now"
- ✅ Form can be filled and submitted
- ✅ Application is saved in database
- ✅ Dashboard shows the applied job
- ✅ Applied Jobs count increases
- ✅ No console errors
