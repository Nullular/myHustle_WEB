# MyHustle - Vercel Deployment Guide
## 🚀 Get Your App Live in 10 Minutes

### **Step 1: Prepare Your Project (2 minutes)**

1. **Initialize Git repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - MyHustle website ready for deployment"
   ```

2. **Create GitHub repository:**
   - Go to [GitHub.com](https://github.com)
   - Click "New repository"
   - Name it: `myhustle-website`
   - Keep it public (or private if you prefer)
   - Don't initialize with README (we already have files)
   - Click "Create repository"

3. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/myhustle-website.git
   git branch -M main
   git push -u origin main
   ```

### **Step 2: Deploy to Vercel (3 minutes)**

1. **Go to [vercel.com](https://vercel.com)**
2. **Click "Sign up" and use GitHub account**
3. **Import your repository:**
   - Click "New Project"
   - Find your `myhustle-website` repo
   - Click "Import"

4. **Configure deployment:**
   - **Project Name:** `myhustle-website`
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

5. **Add Environment Variables:**
   Click "Environment Variables" and add:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

6. **Click "Deploy"**

### **Step 3: Configure Firebase (3 minutes)**

1. **Add Vercel domain to Firebase:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project
   - Go to Authentication → Settings → Authorized domains
   - Add your Vercel domain: `your-app.vercel.app`

2. **Update Firestore security rules** (if needed):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow authenticated users to read/write their own data
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       // Add other rules as needed
     }
   }
   ```

### **Step 4: Custom Domain (Optional - 2 minutes)**

1. **In Vercel Dashboard:**
   - Go to your project
   - Click "Domains"
   - Add your custom domain
   - Follow DNS instructions

2. **Or use the free Vercel domain:**
   - `your-app.vercel.app`

---

## **Quick Commands to Run Now:**
