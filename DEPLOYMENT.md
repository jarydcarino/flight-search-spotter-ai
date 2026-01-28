# Deployment Guide

This guide will help you deploy the Flight Search Engine to various hosting platforms.

## Prerequisites

- GitHub repository with your code
- Amadeus API credentials
- Account on your chosen hosting platform

## Vercel Deployment

### Steps:

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables:
     - `VITE_AMADEUS_CLIENT_ID`
     - `VITE_AMADEUS_CLIENT_SECRET`
   - Click "Deploy"

3. **Your app will be live!** Vercel will provide you with a URL.

## Netlify Deployment

### Steps:

1. **Push to GitHub** (same as above)

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Add environment variables in Site settings → Environment variables:
     - `VITE_AMADEUS_CLIENT_ID`
     - `VITE_AMADEUS_CLIENT_SECRET`
   - Click "Deploy site"

3. **Your app will be live!** Netlify will provide you with a URL.

## Environment Variables

Both platforms require you to add these environment variables:

- `VITE_AMADEUS_CLIENT_ID`: Your Amadeus API Client ID
- `VITE_AMADEUS_CLIENT_SECRET`: Your Amadeus API Client Secret

**Important**: These are prefixed with `VITE_` because Vite exposes them to the client-side code. In a production application, you would typically handle API calls through a backend server to keep credentials secure.

## Post-Deployment Checklist

- [ ] Verify environment variables are set correctly
- [ ] Test flight search functionality
- [ ] Test filters and price graph
- [ ] Test responsive design on mobile
- [ ] Check browser console for errors
- [ ] Verify API rate limits are not exceeded

## Troubleshooting

### API Errors
- Verify your Amadeus API credentials are correct
- Check that you're using test environment credentials
- Ensure environment variables are set in your hosting platform

### Build Errors
- Make sure all dependencies are in `package.json`
- Check that Node.js version is 18+ in your hosting platform settings
- Review build logs for specific error messages

### CORS Issues
- Amadeus API should handle CORS, but if you encounter issues, you may need to proxy requests through a backend

## Security Note

⚠️ **Important**: This application stores API credentials in environment variables that are exposed to the client. This is acceptable for a test/demo application, but in production, you should:

1. Create a backend API proxy
2. Store credentials server-side only
3. Make API calls from your backend
4. Expose only necessary endpoints to the frontend
