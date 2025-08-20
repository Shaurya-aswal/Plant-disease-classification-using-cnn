# Deployment Guide for Pepper Disease Detection System

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally with `npm install -g vercel`
3. **GitHub Repository**: Your code should be pushed to GitHub

## Method 1: Automated Deployment (Recommended)

### Step 1: Run the Deployment Script
```bash
cd "/Users/apple/Desktop/deep learning  project  -- DIsease analysis "
./deploy.sh
```

This script will:
- Install Vercel CLI if needed
- Deploy the backend API first
- Get the backend URL and update frontend environment variables
- Deploy the frontend with the correct backend URL
- Display both deployment URLs

## Method 2: Manual Deployment

### Step 1: Deploy Backend API

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Login to Vercel (first time only):
   ```bash
   vercel login
   ```

3. Deploy the backend:
   ```bash
   vercel --prod
   ```

4. Note the deployment URL (e.g., `https://your-backend.vercel.app`)

### Step 2: Update Frontend Configuration

1. Navigate to the frontend directory:
   ```bash
   cd frontend/plant-disease-detector
   ```

2. Update the production environment variables:
   ```bash
   echo "BACKEND_URL=https://your-backend.vercel.app" > .env.production
   echo "NEXT_PUBLIC_BACKEND_URL=https://your-backend.vercel.app" >> .env.production
   ```

### Step 3: Deploy Frontend

1. Deploy the frontend:
   ```bash
   vercel --prod
   ```

2. Note the deployment URL (e.g., `https://your-frontend.vercel.app`)

## Method 3: GitHub Integration (Continuous Deployment)

### Step 1: Connect Repository to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Set up two separate projects:
   - **Backend**: Set root directory to `backend/`
   - **Frontend**: Set root directory to `frontend/plant-disease-detector/`

### Step 2: Configure Environment Variables

For the **Frontend** project in Vercel dashboard:
1. Go to Settings > Environment Variables
2. Add:
   - `BACKEND_URL`: `https://your-backend.vercel.app`
   - `NEXT_PUBLIC_BACKEND_URL`: `https://your-backend.vercel.app`

### Step 3: Deploy

1. Push code to GitHub
2. Vercel will automatically deploy both projects
3. Update the frontend environment variables with the actual backend URL
4. Redeploy the frontend

## Testing the Deployment

1. Visit your frontend URL
2. Upload a pepper leaf image
3. Check that predictions work correctly
4. Monitor the backend logs in Vercel dashboard

## Troubleshooting

### Common Issues:

1. **CORS Errors**: 
   - Ensure backend has CORS enabled
   - Check that frontend is calling the correct backend URL

2. **Model Loading Errors**:
   - Verify the model file is included in backend deployment
   - Check file paths are relative to deployment directory

3. **Large File Sizes**:
   - Vercel has deployment size limits
   - Model file should be under 50MB (our quantized model is 14MB ✅)

4. **Timeout Errors**:
   - Increase function timeout in vercel.json
   - Optimize model loading and prediction code

## Environment Variables Reference

### Frontend (.env.production)
```
BACKEND_URL=https://your-backend.vercel.app
NEXT_PUBLIC_BACKEND_URL=https://your-backend.vercel.app
```

### Backend
No environment variables needed for basic deployment.

## Custom Domains (Optional)

1. In Vercel dashboard, go to your project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update CORS settings in backend if using custom domains

## Monitoring and Logs

- **Vercel Dashboard**: Monitor deployments and function logs
- **Error Tracking**: Check function logs for errors
- **Performance**: Monitor response times and usage

## Security Considerations

1. **API Rate Limiting**: Consider adding rate limiting to prevent abuse
2. **File Upload Limits**: Current limit is 10MB per image
3. **CORS Configuration**: Restrict origins in production if needed
4. **Environment Variables**: Keep sensitive data in Vercel environment variables

## Next Steps After Deployment

1. Test the application thoroughly
2. Share the frontend URL with users
3. Monitor usage and performance
4. Consider adding analytics
5. Set up error monitoring
6. Plan for scaling if needed
