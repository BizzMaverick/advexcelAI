# 🚀 Final Deployment Instructions

## 1. Deploy Backend to Railway

### Step 1: Create Railway Account
- Go to https://railway.app
- Sign up with GitHub account
- Connect your repository

### Step 2: Deploy Backend
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway init

# Deploy backend
railway up
```

### Step 3: Set Environment Variables in Railway
In Railway dashboard, add:
```
GEMINI_API_KEY=your_actual_gemini_api_key_here
NODE_ENV=production
PORT=5001
```

### Step 4: Get Backend URL
After deployment, Railway will provide a URL like:
`https://advexcel-backend-production.up.railway.app`

## 2. Update Frontend Configuration

### Step 1: Update Netlify Environment Variables
In Netlify dashboard → Site settings → Environment variables:
```
VITE_API_URL=https://your-railway-backend-url.railway.app/api/upload
```

### Step 2: Trigger Netlify Rebuild
- Go to Netlify dashboard
- Click "Trigger deploy" → "Deploy site"
- Or push any change to GitHub (auto-deploy)

## 3. Final Testing

### Test Complete Flow:
1. Visit https://advexcel.online
2. Upload test CSV file
3. Try AI prompt: "sum column B"
4. Verify download works
5. Test on mobile device

## 4. Go Live Checklist

- [ ] Backend deployed to Railway
- [ ] Environment variables set
- [ ] Frontend updated with backend URL
- [ ] Netlify rebuild completed
- [ ] Full functionality tested
- [ ] Mobile responsiveness verified
- [ ] Contact email working
- [ ] All policies accessible

## 🎉 Your Excel AI Assistant is LIVE!

**Frontend**: https://advexcel.online
**Backend**: https://your-backend-url.railway.app
**Contact**: contact@advexcel.online

Ready to serve users worldwide! 🌟