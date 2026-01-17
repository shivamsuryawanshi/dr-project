# AI assisted development
# Quick Deployment Guide

## Automated Deployment (Recommended)

### Option 1: PowerShell Script (Easiest)

Windows PowerShell में run करें:

```powershell
cd "D:\chrome download\MedExJobUpdated"
.\deployment\deploy-frontend.ps1
```

यह script automatically:
1. Frontend build करेगी
2. Files को VPS पर upload करेगी
3. Permissions set करेगी
4. Nginx reload करेगी

---

### Option 2: Manual Steps (If script doesn't work)

#### Step 1: Build
```powershell
cd "D:\chrome download\MedExJobUpdated\frontend"
npm run build
```

#### Step 2: Upload (WinSCP)
1. WinSCP open करें
2. Connect: `root@72.62.196.181`
3. Left: `D:\chrome download\MedExJobUpdated\frontend\dist`
4. Right: `/var/www/medexjob/`
5. Files drag & drop करें

#### Step 3: VPS Commands
```bash
cd /var/www/medexjob
chown -R www-data:www-data .
chmod -R 755 .
chmod 644 index.html
nginx -t && systemctl reload nginx
```

---

## Tips

1. **Faster Development**: Local में test करें (`npm run dev`)
2. **Quick Upload**: WinSCP में bookmark save करें
3. **Auto Deploy**: Script को task scheduler में add करें

---

## Troubleshooting

- **SCP Error**: WinSCP use करें
- **Permission Denied**: VPS password check करें
- **Build Failed**: `npm install` run करें

