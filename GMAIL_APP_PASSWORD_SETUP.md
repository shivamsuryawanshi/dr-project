# AI assisted development

# Gmail App Password Setup Guide

## ❌ Current Issue: Email Authentication Failed

Logs में error दिख रहा है:
```
Email authentication failed. Check mail configuration: Authentication failed
```

**Reason:** Gmail regular password काम नहीं करता, **App Password** चाहिए।

---

## ✅ Solution: Gmail App Password Generate करें

### Step 1: Gmail में 2-Step Verification Enable करें

1. Gmail account में login करें: `shivamsuryawanshi51@gmail.com`
2. Google Account settings में जाएं: https://myaccount.google.com/
3. **Security** tab पर click करें
4. **2-Step Verification** enable करें (अगर already enabled है तो skip करें)

### Step 2: App Password Generate करें

1. Google Account → **Security** → **2-Step Verification**
2. Scroll down करें → **App passwords** पर click करें
3. **Select app**: "Mail" choose करें
4. **Select device**: "Other (Custom name)" choose करें
5. Name enter करें: "MedExJob Backend"
6. **Generate** button click करें
7. **16-character password** copy करें (जैसे: `abcd efgh ijkl mnop`)

### Step 3: application.yml में Update करें

`MedExJobUpdated/backend/src/main/resources/application.yml` में:

```yaml
spring:
  mail:
    password: YOUR_APP_PASSWORD_HERE  # Spaces हटा दें
```

**Example:**
```yaml
spring:
  mail:
    password: abcdefghijklmnop  # Spaces नहीं होने चाहिए
```

### Step 4: Backend Restart करें

```bash
# Backend stop करें (Ctrl+C)
# फिर restart करें
cd MedExJobUpdated/backend
mvn spring-boot:run
```

---

## 🔧 Temporary Fix: OTP Console में Print होगा

अगर email नहीं जा रहा, तो **OTP backend console में print होगा**:

```
═══════════════════════════════════════════════════════
📧 OTP for user@example.com: 123456
⏰ OTP expires in 10 minutes
═══════════════════════════════════════════════════════
```

**Testing के लिए:**
1. Backend terminal check करें
2. OTP वहाँ से copy करें
3. Frontend में enter करें

---

## 📝 Important Notes

1. **App Password ≠ Regular Password**
   - Regular Gmail password काम नहीं करेगा
   - App Password 16 characters का होता है

2. **2-Step Verification Required**
   - App Password generate करने के लिए 2-Step Verification enable होना चाहिए

3. **Password Format**
   - App Password में spaces हो सकते हैं
   - `application.yml` में spaces हटा दें

4. **Security**
   - App Password को secure रखें
   - Production में environment variables use करें

---

## 🧪 Test After Fix

1. App Password generate करें
2. `application.yml` में update करें
3. Backend restart करें
4. Forgot password test करें
5. Email inbox check करें

---

## 🆘 Still Not Working?

अगर अभी भी email नहीं जा रहा:

1. **Check Backend Console:**
   - OTP वहाँ print होगा
   - Use that OTP for testing

2. **Verify App Password:**
   - Gmail में जाकर verify करें
   - New App Password generate करें

3. **Check Gmail Settings:**
   - "Less secure app access" (deprecated, use App Password instead)
   - 2-Step Verification enabled होना चाहिए

---

**Next Steps:** App Password generate करें और `application.yml` में update करें!

