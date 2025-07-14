# 🚀 Quick Backend Deployment

## Option 1: Railway Web Deploy (Recommended)

### Step 1: Go to Railway
1. Visit https://railway.app
2. Click "Start a New Project"
3. Choose "Deploy from GitHub repo"
4. Select your `BizzMaverick/advexcelAI` repository

### Step 2: Configure Deployment
1. **Root Directory**: Leave empty (uses root)
2. **Build Command**: `npm install`
3. **Start Command**: `node openai-proxy-gemini.js`

### Step 3: Set Environment Variables
In Railway dashboard, add these variables:
```
GEMINI_API_KEY=your_actual_gemini_api_key_here
NODE_ENV=production
PORT=$PORT
```

### Step 4: Get Your Backend URL
After deployment, Railway will give you a URL like:
`https://advexcel-backend-production.up.railway.app`

## Option 2: Alternative - Render.com

### Step 1: Go to Render
1. Visit https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository

### Step 2: Configure
- **Name**: advexcel-backend
- **Build Command**: `npm install`
- **Start Command**: `node openai-proxy-gemini.js`

### Step 3: Environment Variables
```
GEMINI_API_KEY=your_gemini_key
NODE_ENV=production
```

## Final Step: Update Frontend

Once you have your backend URL, update Netlify:

1. Go to Netlify dashboard
2. Site settings → Environment variables
3. Add: `VITE_API_URL=https://your-backend-url/api/upload`
4. Trigger deploy

## 🎯 Your site will be fully functional!

**Frontend**: https://advexcel.online ✅
**Backend**: Your Railway/Render URL 🔄
**Complete**: Full Excel AI Assistant! 🌟