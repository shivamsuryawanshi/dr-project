# AI assisted development

# IntelliJ IDEA Run Configuration Fix Guide

## Problem
IntelliJ IDEA में run configuration अभी भी पुराना class name `ccMedexjobBackendApplication` use कर रही है, जबकि actual class name `MedexjobBackendApplication` है।

## Solution - Step by Step

### Method 1: Edit Existing Configuration (Recommended)

1. **IntelliJ IDEA में:**
   - Top-right corner में run configuration dropdown खोलें (जहां `ccMedexjobBackendApplication` दिख रहा है)
   - **"Edit Configurations..."** click करें

2. **Configuration Edit करें:**
   - Left panel में `ccMedexjobBackendApplication` configuration select करें
   - Right panel में **"Main class"** field में:
     - पुराना: `com.medexjob.ccMedexjobBackendApplication`
     - नया: `com.medexjob.MedexjobBackendApplication`
   - **"Apply"** button click करें
   - **"OK"** button click करें

3. **अब Run करें:**
   - Top-right corner से configuration select करें और run button press करें

### Method 2: Delete और Create New Configuration

1. **पुरानी Configuration Delete करें:**
   - Run → Edit Configurations...
   - Left panel में `ccMedexjobBackendApplication` select करें
   - **"-"** (minus) button click करें
   - Confirm करें

2. **नई Configuration Create करें:**
   - `MedexjobBackendApplication.java` file खोलें
   - `main` method के बगल में **green play button** पर **right-click** करें
   - **"Run 'MedexjobBackendApplication.main()'"** select करें
   - यह automatically सही configuration create करेगी

### Method 3: Invalidate Caches (अगर ऊपर वाले methods काम न करें)

1. **File → Invalidate Caches / Restart...**
2. **"Invalidate and Restart"** button click करें
3. IntelliJ IDEA restart होने के बाद:
   - `MedexjobBackendApplication.java` file खोलें
   - `main` method के बगल में green play button click करें

### Method 4: Maven से Run करें (Temporary Solution)

Terminal में run करें:
```powershell
cd "D:\chrome download\new-medex-1\MedExJobUpdated\backend"
mvn spring-boot:run
```

यह automatically सही main class detect करेगा।

## Verification

Run करने के बाद, console में यह message दिखना चाहिए:
```
🚀 MedExJob.com Backend Server is running!
📊 API Base: /api
🌐 Frontend: https://medexjob.com
```

अगर `ClassNotFoundException` आए, तो configuration अभी भी गलत है।

