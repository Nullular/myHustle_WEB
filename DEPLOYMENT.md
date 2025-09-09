# MyHustle Website Deployment Guide

## Hostinger Deployment Options

### Option 1: Node.js Hosting (Recommended)

**Requirements:**
- Hostinger Business or Premium plan with Node.js support
- Node.js 18+ environment

**Steps:**

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Create a production package:**
   - Upload the entire project folder to your Hostinger file manager
   - Or use Git deployment if available

3. **Set Environment Variables in Hostinger:**
   - Go to your hosting control panel
   - Add these environment variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Install dependencies on the server:**
   ```bash
   npm install --production
   ```

5. **Start the application:**
   ```bash
   npm start
   ```

### Option 2: Static Export (Limited Functionality)

If your Hostinger plan only supports static hosting, you can export a static version, but you'll lose server-side features.

**Limitations:**
- No API routes
- No server-side rendering
- Authentication may need client-side only approach

**To export:**
1. Add to `next.config.ts`:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export',
     trailingSlash: true,
     images: {
       unoptimized: true
     }
   }
   ```

2. Build and export:
   ```bash
   npm run build
   ```

3. Upload the `out` folder contents to your domain's public_html directory

### Option 3: Alternative Hosting (Highly Recommended)

For better Next.js support, consider these alternatives:

1. **Vercel** (Made by Next.js team)
   - Perfect Next.js support
   - Free tier available
   - Automatic deployments from GitHub

2. **Netlify**
   - Good Next.js support
   - Free tier available
   - Easy drag-and-drop deployment

3. **Railway/Render**
   - Good for full-stack applications
   - Database hosting included

## Pre-Deployment Checklist

- [ ] Firebase credentials added to environment variables
- [ ] Build completed successfully (`npm run build`)
- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Domain pointed to hosting service

## Post-Deployment Testing

1. Test authentication (login/signup)
2. Test store browsing
3. Test responsive design on mobile
4. Verify Firebase connection
5. Check console for errors

## Troubleshooting

**Common Issues:**
1. **Environment variables not loading:** Ensure they're set in hosting panel
2. **Build errors:** Check Node.js version compatibility
3. **Firebase connection issues:** Verify API keys and project settings
4. **Static assets not loading:** Check public folder deployment

## Production Optimizations

Consider these before going live:
1. Add error monitoring (Sentry)
2. Set up analytics (Google Analytics)
3. Configure SEO metadata
4. Add loading states and error boundaries
5. Set up monitoring and logging
