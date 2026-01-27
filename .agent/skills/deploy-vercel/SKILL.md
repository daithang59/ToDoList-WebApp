---
name: Deploy to Vercel
description: Deploy the To-Do List WebApp to Vercel platform
---

# Deploy to Vercel Skill

This skill guides you through deploying the To-Do List WebApp to Vercel for both frontend and backend.

## Prerequisites

- Vercel account (sign up at https://vercel.com)
- Vercel CLI installed: `npm install -g vercel`
- MongoDB Atlas account for production database (https://www.mongodb.com/cloud/atlas)

## Initial Setup

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Set Up MongoDB Atlas

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Whitelist IP addresses (or allow from anywhere: 0.0.0.0/0)
5. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/todolist`

## Frontend Deployment

### 1. Configure Frontend Environment

Create `frontend/.env.production`:

```env
VITE_API_URL=https://your-backend-url.vercel.app/api
```

### 2. Build Frontend

```bash
cd frontend
npm run build
```

### 3. Deploy Frontend

```bash
# From frontend directory
vercel

# Or for production
vercel --prod
```

Follow prompts:
- Set up and deploy: Y
- Which scope: Select your account
- Link to existing project: N (first time)
- Project name: todolist-webapp-frontend
- Directory: ./
- Override settings: N

### 4. Configure Frontend Environment Variables

In Vercel Dashboard:
1. Go to your frontend project
2. Settings → Environment Variables
3. Add:
   - `VITE_API_URL`: Your backend API URL

## Backend Deployment

### 1. Configure Backend Environment

The backend is already configured with `vercel.json`. Ensure it looks like:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.js"
    }
  ]
}
```

### 2. Deploy Backend

```bash
# From backend directory
cd backend
vercel

# Or for production
vercel --prod
```

### 3. Configure Backend Environment Variables

In Vercel Dashboard:
1. Go to your backend project
2. Settings → Environment Variables
3. Add all variables from `backend/.env.example`:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Generate a secure random string
   - `JWT_EXPIRES_IN`: 7d
   - `NODE_ENV`: production
   - `FRONTEND_URL`: Your frontend Vercel URL
   - `PORT`: 5000 (optional, Vercel handles this)

### 4. Redeploy with Environment Variables

After adding environment variables, trigger a new deployment:

```bash
cd backend
vercel --prod
```

## Update Frontend with Backend URL

After backend deployment, update frontend environment variable:

1. Go to Frontend project in Vercel Dashboard
2. Settings → Environment Variables
3. Update `VITE_API_URL` with your backend URL
4. Redeploy frontend:
   ```bash
   cd frontend
   vercel --prod
   ```

## Verification

### 1. Run Pre-Deployment Check

```bash
node .agent/skills/deploy-vercel/scripts/pre-deploy-check.js
```

### 2. Manual Verification

1. **Frontend**: Visit your frontend URL
2. **Backend**: Visit `https://your-backend-url.vercel.app/api/health`
3. **Test Authentication**: Try registering and logging in
4. **Test Todo Operations**: Create, update, delete todos
5. **Check Logs**: View logs in Vercel Dashboard

## Continuous Deployment

### Set Up GitHub Integration

1. Push code to GitHub repository
2. In Vercel Dashboard:
   - Import Git Repository
   - Select your repository
   - Configure:
     - Framework: Vite (frontend) / Other (backend)
     - Root Directory: `frontend/` or `backend/`
     - Build Command: `npm run build`
     - Output Directory: `dist` (frontend only)

3. Add environment variables in Vercel

4. Every push to `main` branch will trigger automatic deployment

## Rollback Deployment

### Using Vercel CLI

```bash
# List recent deployments
vercel ls

# Promote a specific deployment to production
vercel promote <deployment-url>
```

### Using Vercel Dashboard

1. Go to project → Deployments
2. Find the desired deployment
3. Click "..." → Promote to Production

## Environment-Specific Deployments

### Preview Deployments

Every branch/PR gets a preview deployment automatically:

```bash
# Deploy to preview
vercel
```

### Production Deployments

Only deploy to production when ready:

```bash
# Deploy to production
vercel --prod
```

## Monitoring

### View Logs

```bash
# Real-time logs
vercel logs <deployment-url> --follow

# Recent logs
vercel logs <deployment-url>
```

### Check Build Logs

In Vercel Dashboard:
1. Go to project → Deployments
2. Click on a deployment
3. View build logs and function logs

## Troubleshooting

### Build Fails

1. Check build logs in Vercel Dashboard
2. Ensure dependencies are in `dependencies`, not `devDependencies`
3. Verify Node.js version matches (set in `package.json` engines field)

### Environment Variables Not Working

1. Ensure variables are set in Vercel Dashboard
2. Redeploy after adding variables
3. For frontend, variables must start with `VITE_`

### MongoDB Connection Issues

1. Verify connection string is correct
2. Check MongoDB Atlas network access (whitelist 0.0.0.0/0)
3. Verify database user credentials
4. Check MongoDB Atlas cluster status

### CORS Errors

Update `FRONTEND_URL` in backend environment variables:

```env
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Function Timeout

Vercel has execution time limits:
- Hobby: 10 seconds
- Pro: 60 seconds

Optimize long-running operations or upgrade plan.

## Best Practices

1. **Use Environment Variables**: Never commit secrets to git
2. **Test Before Production**: Use preview deployments
3. **Monitor Performance**: Check Vercel Analytics
4. **Set Up Alerts**: Configure Vercel notifications
5. **Use Custom Domains**: Set up custom domain for production
6. **Enable HTTPS**: Vercel provides SSL certificates automatically
7. **Implement Health Checks**: Use `/api/health` endpoint
8. **Review Logs Regularly**: Monitor for errors

## Custom Domain Setup

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed by Vercel
4. Update environment variables with new domain
5. Redeploy

## Cost Optimization

### Vercel Free Tier Limits

- 100 GB bandwidth/month
- 100 hours serverless function execution

### Optimization Tips

1. Use efficient database queries
2. Implement caching where possible
3. Optimize bundle size (frontend)
4. Use preview deployments sparingly

## Useful Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# List deployments
vercel ls

# View logs
vercel logs

# Remove deployment
vercel rm <deployment-name>

# Get deployment info
vercel inspect <deployment-url>

# Set environment variable
vercel env add <NAME>
```

## See Also

- Official documentation: https://vercel.com/docs
- VERCEL_DEPLOYMENT.md in project root
- Vercel CLI reference: https://vercel.com/docs/cli
