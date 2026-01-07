# 🚀 Next.js Frontend Deployment Guide
## Complete Step-by-Step Instructions for Instant Share Cards

---

## 📋 **PRE-DEPLOYMENT CHECKLIST**

### 1. **Verify Your Code is Ready**
- ✅ All components migrated from React
- ✅ All routes working
- ✅ Metadata generation optimized for share cards
- ✅ Images optimized (600x315 for articles, 600x800 for epapers)

---

## 🎯 **OPTION 1: VERCEL DEPLOYMENT (RECOMMENDED)**
**Why Vercel?** 
- Built specifically for Next.js
- Automatic optimizations
- Edge network for instant global response
- Free tier available
- Best for share cards (instant metadata)

---

### **STEP 1: Prepare Your Repository**

1. **Push your Next.js code to GitHub/GitLab/Bitbucket**
   ```bash
   cd Nextjs_frontend
   git init
   git add .
   git commit -m "Next.js frontend ready for deployment"
   git branch -M main
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

---

### **STEP 2: Create Vercel Account & Project**

1. **Go to Vercel**
   - Visit: https://vercel.com
   - Click **"Sign Up"** (use GitHub account for easiest setup)

2. **Import Your Project**
   - Click **"Add New..."** → **"Project"**
   - Select your repository (GitHub/GitLab/Bitbucket)
   - Click **"Import"**

3. **Configure Project Settings**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `Nextjs_frontend` (if repo root) OR leave blank if Next.js is in root
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

---

### **STEP 3: Configure Environment Variables**

**Click on your project → Settings → Environment Variables**

Add these variables:

```
NEXT_PUBLIC_API_URL=https://navmanch-backend.onrender.com/api
NEXT_PUBLIC_SITE_URL=https://navmanchnews.com
NEXT_PUBLIC_FB_APP_ID=YOUR_FACEBOOK_APP_ID (if you have one)
```

**Important:**
- Click **"Save"** after adding each variable
- Make sure to select **"Production"**, **"Preview"**, and **"Development"** for each variable
- Click **"Redeploy"** after adding environment variables

---

### **STEP 4: Deploy**

1. **Click "Deploy" button**
   - Vercel will automatically:
     - Install dependencies (`npm install`)
     - Build your app (`npm run build`)
     - Deploy to Edge network

2. **Wait for deployment** (usually 2-3 minutes)
   - You'll see build logs in real-time
   - Deployment URL will be: `your-project.vercel.app`

3. **Test the deployment**
   - Visit: `https://your-project.vercel.app`
   - Check if site loads correctly

---

### **STEP 5: Configure Custom Domain (navmanchnews.com)**

1. **Go to Project Settings → Domains**

2. **Add Custom Domain**
   - Enter: `navmanchnews.com`
   - Click **"Add"**

3. **Add DNS Records** (in your domain registrar - GoDaddy, Namecheap, etc.)

   **Option A: Using A Record (Recommended)**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   TTL: 3600
   ```

   **Option B: Using CNAME (Alternative)**
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   TTL: 3600
   ```

   **For www subdomain:**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 3600
   ```

4. **Wait for DNS Propagation** (5 minutes to 48 hours)
   - Vercel will show "Valid Configuration" when DNS is correct
   - You can check status in Vercel dashboard

5. **SSL Certificate**
   - Vercel automatically provisions SSL certificates
   - HTTPS will be enabled automatically

---

### **STEP 6: Update DNS to Point to Vercel**

**In your domain registrar (where you bought navmanchnews.com):**

1. **Remove old DNS records pointing to Render**
   - Delete A record pointing to Render IP
   - Delete CNAME record pointing to Render

2. **Add new DNS records for Vercel** (as shown in Step 5)

3. **Wait for DNS propagation**
   - Check: https://dnschecker.org
   - Enter: `navmanchnews.com`
   - Should show Vercel IP: `76.76.21.21`

---

### **STEP 7: Test Share Cards**

1. **Test on WhatsApp**
   - Open WhatsApp
   - Share: `https://navmanchnews.com/news/YOUR_ARTICLE_ID`
   - Image and metadata should appear **INSTANTLY**

2. **Test on Facebook**
   - Go to: https://developers.facebook.com/tools/debug/
   - Enter: `https://navmanchnews.com/news/YOUR_ARTICLE_ID`
   - Click **"Scrape Again"**
   - Should show image and metadata

3. **Test on Twitter**
   - Go to: https://cards-dev.twitter.com/validator
   - Enter: `https://navmanchnews.com/news/YOUR_ARTICLE_ID`
   - Should show card preview

---

## 🎯 **OPTION 2: RENDER DEPLOYMENT (Alternative)**

If you prefer to stay on Render (where your React app is):

---

### **STEP 1: Create New Render Service**

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Click **"New +"** → **"Web Service"**

2. **Connect Repository**
   - Connect your GitHub/GitLab/Bitbucket account
   - Select your repository
   - Choose the branch (usually `main`)

---

### **STEP 2: Configure Build Settings**

**In Render dashboard, configure:**

- **Name:** `navmanch-nextjs-frontend` (or any name)
- **Environment:** `Node`
- **Region:** Choose closest to your users
- **Branch:** `main` (or your default branch)
- **Root Directory:** `Nextjs_frontend` (if Next.js is in subfolder) OR leave blank if in root
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Instance Type:** 
  - **Free:** 512 MB RAM (for testing)
  - **Starter:** $7/month (recommended for production)

---

### **STEP 3: Add Environment Variables**

**In Render dashboard → Environment:**

Click **"Add Environment Variable"** and add:

```
NEXT_PUBLIC_API_URL=https://navmanch-backend.onrender.com/api
NEXT_PUBLIC_SITE_URL=https://navmanchnews.com
NEXT_PUBLIC_FB_APP_ID=YOUR_FACEBOOK_APP_ID (optional)
NODE_ENV=production
```

**Click "Save Changes"**

---

### **STEP 4: Deploy**

1. **Click "Create Web Service"**
   - Render will:
     - Clone your repo
     - Install dependencies
     - Build your app
     - Start the server

2. **Wait for deployment** (5-10 minutes first time)
   - You'll see build logs
   - Service URL: `your-service.onrender.com`

3. **Test the deployment**
   - Visit: `https://your-service.onrender.com`
   - Check if site loads

---

### **STEP 5: Configure Custom Domain**

1. **In Render Dashboard → Your Service → Settings → Custom Domains**

2. **Add Custom Domain**
   - Enter: `navmanchnews.com`
   - Click **"Add"**

3. **Update DNS Records** (in your domain registrar)

   **For Root Domain:**
   ```
   Type: CNAME
   Name: @
   Value: your-service.onrender.com
   TTL: 3600
   ```

   **OR if CNAME not supported for root:**
   ```
   Type: A
   Name: @
   Value: [Render will provide IP - check in dashboard]
   TTL: 3600
   ```

   **For www subdomain:**
   ```
   Type: CNAME
   Name: www
   Value: your-service.onrender.com
   TTL: 3600
   ```

4. **Wait for DNS Propagation**
   - Render will show "Verified" when DNS is correct
   - SSL certificate will be auto-provisioned

---

### **STEP 6: Update DNS to Point to Render**

**In your domain registrar:**

1. **Remove old DNS records** (pointing to old React app)
2. **Add new DNS records** (as shown in Step 5)
3. **Wait for propagation** (5 minutes to 48 hours)

---

## 🔧 **ENVIRONMENT VARIABLES REFERENCE**

### **Required Variables:**

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=https://navmanch-backend.onrender.com/api

# Your site URL (for absolute URLs in metadata)
NEXT_PUBLIC_SITE_URL=https://navmanchnews.com
```

### **Optional Variables:**

```bash
# Facebook App ID (for Facebook share cards)
NEXT_PUBLIC_FB_APP_ID=your_facebook_app_id

# Node environment
NODE_ENV=production
```

---

## 🧪 **TESTING SHARE CARDS**

### **1. Test News Article Share Card:**

```
URL: https://navmanchnews.com/news/YOUR_ARTICLE_ID
```

**Expected:**
- ✅ Image appears instantly (600x315, optimized)
- ✅ Title shows correctly
- ✅ Description shows correctly
- ✅ Works on iOS WhatsApp (instant)
- ✅ Works on Android WhatsApp
- ✅ Works on Facebook
- ✅ Works on Twitter

---

### **2. Test E-Paper Share Card:**

```
URL: https://navmanchnews.com/epaper/EPAPER_ID
```

**Expected:**
- ✅ E-paper thumbnail appears (600x800, optimized)
- ✅ Title and date show correctly

---

### **3. Test E-Paper Section Share Card:**

```
URL: https://navmanchnews.com/epaper/EPAPER_ID/page/PAGE_NO/section/SECTION_ID
```

**Expected:**
- ✅ Cropped section image appears (600x800, optimized)
- ✅ Section title shows correctly

---

## 🔍 **TROUBLESHOOTING**

### **Issue: Share cards not showing images**

**Solution:**
1. Check if image URLs are absolute HTTPS
2. Verify Cloudinary images are accessible
3. Test image URL directly in browser
4. Check Facebook Debugger: https://developers.facebook.com/tools/debug/

---

### **Issue: DNS not working**

**Solution:**
1. Wait 24-48 hours for DNS propagation
2. Check DNS: https://dnschecker.org
3. Verify DNS records in domain registrar
4. Clear DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)

---

### **Issue: Build fails on Vercel/Render**

**Solution:**
1. Check build logs for errors
2. Verify `package.json` has correct scripts
3. Ensure all dependencies are in `package.json`
4. Check Node.js version (should be 18+)

---

### **Issue: Environment variables not working**

**Solution:**
1. Ensure variables start with `NEXT_PUBLIC_` for client-side access
2. Redeploy after adding environment variables
3. Check variable names (case-sensitive)
4. Verify values don't have extra spaces

---

## 📊 **MONITORING & ANALYTICS**

### **Vercel:**
- Go to project → Analytics
- View page views, performance metrics
- Check Edge network performance

### **Render:**
- Go to service → Metrics
- View CPU, memory usage
- Check response times

---

## 🎉 **SUCCESS CHECKLIST**

- ✅ Next.js app deployed and accessible
- ✅ Custom domain (navmanchnews.com) working
- ✅ HTTPS enabled (SSL certificate active)
- ✅ Share cards showing images instantly
- ✅ Works on iOS WhatsApp (no delay)
- ✅ Works on Android WhatsApp
- ✅ Works on Facebook
- ✅ Works on Twitter
- ✅ All routes working (`/news`, `/epaper`, etc.)

---

## 🚨 **IMPORTANT NOTES**

1. **Keep React App Running Initially**
   - Don't delete React app immediately
   - Test Next.js thoroughly first
   - Once confirmed working, you can remove React app

2. **DNS Propagation Time**
   - Can take 5 minutes to 48 hours
   - Be patient, check periodically

3. **SSL Certificates**
   - Vercel: Automatic (instant)
   - Render: Automatic (may take a few minutes)

4. **Backend API**
   - Ensure backend is accessible from new frontend
   - Check CORS settings if needed

5. **Image Optimization**
   - Images are optimized server-side in `generateMetadata`
   - No client-side processing needed
   - Cloudinary URLs are optimized automatically

---

## 📞 **NEED HELP?**

If you encounter issues:
1. Check deployment logs
2. Verify environment variables
3. Test URLs directly
4. Check DNS propagation status
5. Verify backend API is accessible

---

**🎊 Congratulations! Your Next.js frontend is now ready for instant share cards!**

