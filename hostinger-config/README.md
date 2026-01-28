# Hostinger Configuration Files for MedExJob.com

This folder contains configuration files that need to be uploaded to your Hostinger hosting.

## 📁 Folder Structure on Hostinger

```
medexjob.com/
└── public_html/
    ├── index.html
    ├── assets/
    ├── uploads/                    ← Resume files stored here
    │   └── .htaccess              ← Upload from this folder
    └── .htaccess (optional)       ← Root htaccess if needed
```

## 📋 Files to Upload

### 1. uploads/.htaccess
**Upload to:** `public_html/uploads/.htaccess`

This file:
- ✅ Enables CORS for resume downloads
- ✅ Forces download for PDF/DOC/DOCX files
- ✅ Prevents directory listing
- ✅ Blocks dangerous file types (PHP, EXE, etc.)
- ✅ Sets correct MIME types
- ✅ Adds security headers

## 🚀 How to Upload

### Method 1: Hostinger File Manager
1. Login to Hostinger hPanel
2. Go to Files → File Manager
3. Click "Access files of medexjob.com"
4. Navigate to `public_html`
5. Create `uploads` folder if not exists
6. Enter `uploads` folder
7. Click "New file" → name it `.htaccess`
8. Copy content from `uploads/.htaccess` in this folder
9. Save

### Method 2: FTP (FileZilla)
1. Connect to FTP:
   - Host: 82.180.143.101
   - Username: u284488379
   - Password: (your FTP password)
   - Port: 21
2. Navigate to `public_html/uploads/`
3. Upload `.htaccess` file

## ✅ Verification

After uploading, test:

1. **Directory listing blocked:**
   - Visit: `https://medexjob.com/uploads/`
   - Should show 403 Forbidden (not file list)

2. **CORS working:**
   ```bash
   curl -I -X OPTIONS https://medexjob.com/uploads/test.pdf
   ```
   Should include `Access-Control-Allow-Origin: *`

3. **Resume download:**
   - Upload a test resume via the app
   - Click "Download Resume" button
   - File should download properly

## 🔒 Security Notes

- The `.htaccess` blocks execution of PHP/scripts in uploads folder
- Only PDF, DOC, DOCX, PNG, JPG, JPEG, GIF, WEBP files are allowed
- Hidden files (starting with .) are denied
- This protects against malicious file uploads

## 🔧 Troubleshooting

### 500 Internal Server Error
- Check if mod_headers is enabled on Hostinger
- Try removing the `<IfModule mod_headers.c>` sections temporarily

### Files not downloading
- Verify the resume URL is correct: `https://medexjob.com/uploads/filename.pdf`
- Check if file actually exists on server

### CORS errors in browser console
- Verify `.htaccess` is uploaded correctly
- Check file permissions (should be 644)

## 📞 FTP Credentials

```
Host: 82.180.143.101
Port: 21
Username: u284488379
Remote Directory: public_html/uploads
```

---

Last updated: January 2026

