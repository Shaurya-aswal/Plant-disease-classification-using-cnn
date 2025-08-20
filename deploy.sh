#!/bin/bash

echo "🚀 Deploying Pepper Disease Detection System to Vercel"
echo "=================================================="

# Install Vercel CLI if not installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy Backend
echo ""
echo "📦 Deploying Backend API..."
cd backend
vercel --prod
BACKEND_URL=$(vercel --prod --confirm 2>&1 | grep -o 'https://[^[:space:]]*')
echo "Backend deployed at: $BACKEND_URL"
cd ..

# Update Frontend Environment Variables
echo ""
echo "⚙️  Updating Frontend Environment Variables..."
cd frontend/plant-disease-detector
echo "BACKEND_URL=$BACKEND_URL" > .env.production
echo "NEXT_PUBLIC_BACKEND_URL=$BACKEND_URL" >> .env.production

# Deploy Frontend
echo ""
echo "🌐 Deploying Frontend..."
vercel --prod
FRONTEND_URL=$(vercel --prod --confirm 2>&1 | grep -o 'https://[^[:space:]]*')
echo "Frontend deployed at: $FRONTEND_URL"

echo ""
echo "🎉 Deployment Complete!"
echo "Backend API: $BACKEND_URL"
echo "Frontend App: $FRONTEND_URL"
echo ""
echo "🔧 Next Steps:"
echo "1. Test the deployed application"
echo "2. Update any hardcoded URLs in your code"
echo "3. Set up custom domains if needed"
