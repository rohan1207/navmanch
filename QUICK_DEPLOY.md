# ⚡ Quick Deployment Reference

## 🚀 VERCEL (Recommended - 5 minutes)

### 1. Push to GitHub
```bash
cd Nextjs_frontend
git add .
git commit -m "Ready for deployment"
git push
```

### 2. Deploy on Vercel
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repo
4. **Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://navmanch-backend.onrender.com/api
   NEXT_PUBLIC_SITE_URL=https://navmanchnews.com
   ```
5. Click "Deploy"

### 3. Add Custom Domain
1. Project → Settings → Domains
2. Add: `navmanchnews.com`
3. Update DNS in your registrar:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

---

## 🖥️ RENDER (Alternative)

### 1. Create Web Service
1. Go to https://dashboard.render.com
2. New + → Web Service
3. Connect repository

### 2. Build Settings
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Root Directory:** `Nextjs_frontend` (if in subfolder)

### 3. Environment Variables
```
NEXT_PUBLIC_API_URL=https://navmanch-backend.onrender.com/api
NEXT_PUBLIC_SITE_URL=https://navmanchnews.com
NODE_ENV=production
```

### 4. Custom Domain
1. Settings → Custom Domains
2. Add: `navmanchnews.com`
3. Update DNS:
   ```
   Type: CNAME
   Name: @
   Value: your-service.onrender.com
   ```

---

## ✅ Test Share Cards

1. **WhatsApp:** Share `https://navmanchnews.com/news/ARTICLE_ID`
2. **Facebook:** https://developers.facebook.com/tools/debug/
3. **Twitter:** https://cards-dev.twitter.com/validator

---

## 🔧 Required Environment Variables

```bash
NEXT_PUBLIC_API_URL=https://navmanch-backend.onrender.com/api
NEXT_PUBLIC_SITE_URL=https://navmanchnews.com
```

---

## 📝 Build Commands

- **Build:** `npm run build`
- **Start:** `npm start`
- **Dev:** `npm run dev`

---

## 🌐 DNS Records

### Vercel:
```
A Record: @ → 76.76.21.21
CNAME: www → cname.vercel-dns.com
```

### Render:
```
CNAME: @ → your-service.onrender.com
CNAME: www → your-service.onrender.com
```

