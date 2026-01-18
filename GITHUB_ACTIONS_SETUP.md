# AI assisted development

# GitHub Actions CI/CD Setup Guide

## ✅ Files Created

### 1. Backend CI/CD Workflow
**File:** `.github/workflows/backend-ci-cd.yml`

**Features:**
- ✅ Builds Spring Boot backend with Maven
- ✅ Runs tests with MySQL service
- ✅ Creates JAR artifact
- ✅ Uploads artifacts for download

**Triggers:**
- Push to `main` or `develop` branch (when backend files change)
- Pull requests to `main` or `develop` branch

---

### 2. Frontend CI/CD Workflow
**File:** `.github/workflows/frontend-ci-cd.yml`

**Features:**
- ✅ Builds React frontend with Vite
- ✅ Installs npm dependencies
- ✅ Creates production build
- ✅ Uploads build artifacts

**Triggers:**
- Push to `main` or `develop` branch (when frontend files change)
- Pull requests to `main` or `develop` branch

---

### 3. Combined CI Pipeline
**File:** `.github/workflows/ci.yml`

**Features:**
- ✅ Runs both backend and frontend CI in parallel
- ✅ Shows combined status
- ✅ Fails if any job fails

**Triggers:**
- Push to `main` or `develop` branch
- Pull requests to `main` or `develop` branch

---

## 🚀 How to Execute

### Step 1: Commit and Push to GitHub

```powershell
# Navigate to project root
cd F:\backup-doctor-application-show\new-medex-1\MedExJobUpdated

# Check status
git status

# Add workflow files
git add .github/workflows/
git add .gitignore

# Commit
git commit -m "Add GitHub Actions CI/CD workflows"

# Push to GitHub (this will automatically trigger workflows)
git push origin main
```

---

## 📊 How GitHub Actions Works

### Automatic Execution

1. **On Push:**
   - Jab aap `main` ya `develop` branch mein push karte hain
   - GitHub automatically workflows detect karta hai
   - Workflows automatically run hote hain

2. **On Pull Request:**
   - Jab koi PR create hota hai
   - Workflows automatically run hote hain
   - PR status check mein results dikhte hain

3. **Path-based Triggers:**
   - Backend workflow sirf tab run hoga jab `MedExJobUpdated/backend/**` files change hongi
   - Frontend workflow sirf tab run hoga jab `MedExJobUpdated/frontend/**` files change hongi

---

## 🔍 Monitor Workflows

### View Workflows:

1. **GitHub Repository** → **Actions** tab
2. Left sidebar mein workflows dikhenge:
   - ✅ Backend CI/CD
   - ✅ Frontend CI/CD
   - ✅ Full CI Pipeline

### View Workflow Runs:

1. **Actions** tab → Workflow select karein
2. Recent runs list mein dikhenge
3. Har run ka status:
   - ✅ Green = Success
   - ❌ Red = Failed
   - ⏳ Yellow = Running

### View Logs:

1. Run click karein
2. Jobs list dikhega
3. Job click karein
4. Steps list dikhega
5. Step click karein → Full logs dikhenge

---

## 🧪 Test Workflows

### Test Backend Workflow:

```powershell
# Backend file mein small change karein
cd MedExJobUpdated\backend
# Example: README update ya comment add

# Commit aur push
git add .
git commit -m "Test: Trigger backend CI/CD"
git push origin main
```

**Expected Result:**
- Backend CI/CD workflow automatically run hoga
- Build successful hoga
- JAR file create hoga
- Artifacts upload honge

---

### Test Frontend Workflow:

```powershell
# Frontend file mein small change karein
cd MedExJobUpdated\frontend
# Example: README update ya comment add

# Commit aur push
git add .
git commit -m "Test: Trigger frontend CI/CD"
git push origin main
```

**Expected Result:**
- Frontend CI/CD workflow automatically run hoga
- npm install hoga
- Build successful hoga
- dist/ folder create hoga
- Artifacts upload honge

---

## 📥 Download Artifacts

### After Workflow Completes:

1. **Actions** tab → Completed workflow run click karein
2. **Artifacts** section mein artifacts dikhenge:
   - `backend-jar` - Backend JAR file
   - `frontend-build` - Frontend build files
3. Download button click karein
4. ZIP file download hoga

---

## ⚙️ Workflow Configuration

### Backend Workflow:

- **Java Version:** 17
- **Maven Cache:** Enabled
- **MySQL Service:** 8.0 (for tests)
- **Build Command:** `mvn clean package -DskipTests`
- **Test Command:** `mvn test`

### Frontend Workflow:

- **Node Version:** 20
- **npm Cache:** Enabled
- **Build Command:** `npm run build`
- **Install Command:** `npm ci`

---

## 🔧 Customization

### Add Deployment Step:

Backend workflow mein deployment add karne ke liye:

```yaml
- name: Deploy to Server
  env:
    SERVER_HOST: ${{ secrets.SERVER_HOST }}
    SERVER_USER: ${{ secrets.SERVER_USER }}
    SERVER_SSH_KEY: ${{ secrets.SERVER_SSH_KEY }}
  run: |
    # Add your deployment commands here
    echo "Deploying to server..."
```

### Add Secrets:

1. **GitHub Repository** → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** click karein
3. Add secrets:
   - `SERVER_HOST` - Your server IP/domain
   - `SERVER_USER` - SSH username
   - `SERVER_SSH_KEY` - Private SSH key

---

## ❌ Troubleshooting

### Workflow Fails:

1. **Check Logs:**
   - Failed step click karein
   - Error message dekh sakte hain

2. **Common Issues:**
   - **Maven dependencies fail:** Cache issue - next run mein fix hoga
   - **MySQL connection fail:** Service health check - retry automatically
   - **npm install fail:** Package-lock.json issue - verify file exists
   - **Build fail:** Check code for errors

3. **Re-run Workflow:**
   - Failed workflow run click karein
   - **Re-run all jobs** button click karein

---

## ✅ Success Checklist

- [x] `.github/workflows/backend-ci-cd.yml` created
- [x] `.github/workflows/frontend-ci-cd.yml` created
- [x] `.github/workflows/ci.yml` created
- [x] `.gitignore` updated
- [ ] Files committed to Git
- [ ] Files pushed to GitHub
- [ ] Workflows visible in GitHub Actions tab
- [ ] Test workflow run successful

---

## 🎯 Next Steps

1. **Commit and Push:**
   ```powershell
   git add .github/
   git commit -m "Add GitHub Actions CI/CD workflows"
   git push origin main
   ```

2. **Verify in GitHub:**
   - Repository → Actions tab
   - Workflows dikhne chahiye
   - First run automatically start hoga

3. **Monitor First Run:**
   - Actions tab mein watch karein
   - Logs check karein
   - Success confirm karein

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Maven Setup Action](https://github.com/actions/setup-java)
- [Node.js Setup Action](https://github.com/actions/setup-node)
- [Upload Artifacts Action](https://github.com/actions/upload-artifact)

---

## ✅ Summary

**All GitHub Actions workflow files have been created successfully!**

- ✅ Backend CI/CD workflow
- ✅ Frontend CI/CD workflow
- ✅ Combined CI pipeline
- ✅ `.gitignore` updated

**Next:** Commit aur push karein, GitHub Actions automatically run hoga! 🚀

