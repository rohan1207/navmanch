# ✅ Deployment Checklist

## Pre-Deployment

- [ ] Code pushed to GitHub/GitLab/Bitbucket
- [ ] All components tested locally
- [ ] Share cards tested locally (if possible)
- [ ] Environment variables documented

---

## Vercel Deployment

- [ ] Vercel account created
- [ ] Repository connected to Vercel
- [ ] Project created in Vercel
- [ ] Environment variables added:
  - [ ] `NEXT_PUBLIC_API_URL`
  - [ ] `NEXT_PUBLIC_SITE_URL`
  - [ ] `NEXT_PUBLIC_FB_APP_ID` (optional)
- [ ] First deployment successful
- [ ] Test URL works: `https://your-project.vercel.app`
- [ ] Custom domain added: `navmanchnews.com`
- [ ] DNS records updated in domain registrar
- [ ] DNS propagation verified (check dnschecker.org)
- [ ] SSL certificate active (HTTPS working)
- [ ] Site accessible at `https://navmanchnews.com`

---

## Render Deployment (Alternative)

- [ ] Render account created
- [ ] Web service created
- [ ] Repository connected
- [ ] Build settings configured:
  - [ ] Build command: `npm install && npm run build`
  - [ ] Start command: `npm start`
  - [ ] Root directory set (if needed)
- [ ] Environment variables added:
  - [ ] `NEXT_PUBLIC_API_URL`
  - [ ] `NEXT_PUBLIC_SITE_URL`
  - [ ] `NODE_ENV=production`
- [ ] First deployment successful
- [ ] Test URL works: `https://your-service.onrender.com`
- [ ] Custom domain added: `navmanchnews.com`
- [ ] DNS records updated in domain registrar
- [ ] DNS propagation verified
- [ ] SSL certificate active
- [ ] Site accessible at `https://navmanchnews.com`

---

## Testing Share Cards

### News Articles
- [ ] Test: `https://navmanchnews.com/news/ARTICLE_ID`
- [ ] Image appears instantly
- [ ] Title shows correctly
- [ ] Description shows correctly
- [ ] Works on iOS WhatsApp
- [ ] Works on Android WhatsApp
- [ ] Works on Facebook (test with debugger)
- [ ] Works on Twitter (test with validator)

### E-Paper
- [ ] Test: `https://navmanchnews.com/epaper/EPAPER_ID`
- [ ] E-paper thumbnail appears
- [ ] Title and date show correctly
- [ ] Works on all platforms

### E-Paper Sections
- [ ] Test: `https://navmanchnews.com/epaper/ID/page/PAGE/section/SECTION`
- [ ] Cropped section image appears
- [ ] Section title shows correctly
- [ ] Works on all platforms

---

## Post-Deployment

- [ ] All routes working:
  - [ ] `/` (Home)
  - [ ] `/news/:id` (News Detail)
  - [ ] `/epaper` (E-Paper List)
  - [ ] `/epaper/:id` (E-Paper Viewer)
  - [ ] `/epaper/:id/page/:pageNo/section/:sectionId` (Section)
  - [ ] `/category/:categoryId`
  - [ ] `/articles`
  - [ ] `/blogs`
  - [ ] `/shorts`
  - [ ] `/gallery`
  - [ ] `/events`
- [ ] Images loading correctly
- [ ] API calls working
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Desktop responsive

---

## DNS Migration (From React to Next.js)

- [ ] Old React app DNS records noted (for rollback if needed)
- [ ] New Next.js DNS records added
- [ ] Old DNS records removed (after Next.js confirmed working)
- [ ] DNS propagation complete (24-48 hours)
- [ ] Both www and root domain working

---

## Monitoring

- [ ] Analytics set up (if needed)
- [ ] Error tracking set up (if needed)
- [ ] Performance monitoring active
- [ ] Uptime monitoring active

---

## Rollback Plan (If Needed)

- [ ] Old React app still accessible
- [ ] DNS records documented for quick rollback
- [ ] Backup of Next.js deployment

---

## ✅ Final Verification

- [ ] Site loads at `https://navmanchnews.com`
- [ ] Share cards work instantly on iOS
- [ ] Share cards work on Android
- [ ] All features working
- [ ] No critical errors
- [ ] Performance acceptable

---

**🎉 Deployment Complete!**

