# Netlify Deployment Guide

This document provides instructions for deploying the QuizmasTime frontend to Netlify.

## Prerequisites

- A Netlify account (free tier is sufficient)
- The backend API deployed on Railway
- GitHub repository connected to Netlify

## Deployment Steps

### 1. Connect Repository to Netlify

1. Log in to [Netlify](https://app.netlify.com/)
2. Click "Add new site" > "Import an existing project"
3. Choose "GitHub" and authorize Netlify to access your repository
4. Select the `quizmastime` repository

### 2. Configure Build Settings

Netlify will automatically detect the `netlify.toml` configuration file. Verify these settings:

- **Base directory**: `quizmastime-frontend`
- **Build command**: `npm run build`
- **Publish directory**: `dist/quizmastime-frontend/browser`
- **Node version**: 22 (set in netlify.toml)

### 3. Configure Environment Variables

**IMPORTANT**: You must configure the backend API URL before deployment.

1. Go to "Site settings" > "Environment variables"
2. Add the following variable:
   - **Key**: `API_URL` (or update `environment.prod.ts` directly)
   - **Value**: Your Railway backend URL (e.g., `https://quizmastime-backend-production.up.railway.app/api`)

**Alternative**: Directly edit `src/environments/environment.prod.ts` and replace the `apiUrl` with your actual Railway backend URL before deploying.

### 4. Deploy

1. Click "Deploy site"
2. Netlify will:
   - Install dependencies
   - Build the Angular application
   - Deploy to a unique URL (e.g., `https://random-name-123.netlify.app`)

### 5. Configure Custom Domain (Optional)

1. Go to "Domain settings"
2. Click "Add domain"
3. Follow the instructions to configure your custom domain

## Post-Deployment

### Verify Deployment

1. Visit your Netlify URL
2. Check that the application loads correctly
3. Test the connection to the backend API
4. Verify that Angular routing works (navigate to different pages and refresh)

### Configure CORS on Backend

Ensure your Railway backend has the Netlify domain configured in CORS settings:

1. Update `application.properties` on the backend:
   ```properties
   cors.allowed.origins=https://your-netlify-domain.netlify.app
   ```
2. Redeploy the backend if necessary

## Automatic Deployments

Netlify is configured for continuous deployment:

- **Production**: Pushes to the `main` branch trigger production deployments
- **Deploy Previews**: Pull requests automatically generate preview deployments

## Configuration Files

### netlify.toml

The main Netlify configuration file located in `quizmastime-frontend/netlify.toml`:

- Defines build settings
- Configures redirects for Angular SPA routing
- Sets security headers
- Configures caching for static assets

### _redirects

A backup redirect configuration in `src/_redirects`:

- Ensures all routes redirect to `index.html` for client-side routing
- Included as an asset in the build output

## Troubleshooting

### Build Fails

- Check the build logs in Netlify dashboard
- Verify that `package.json` dependencies are correct
- Ensure Node version matches (Node 22)

### API Connection Issues

- Verify the `apiUrl` in `environment.prod.ts`
- Check CORS configuration on the backend
- Use browser developer tools to inspect network requests

### Routing Issues (404 errors)

- Verify `_redirects` file is in the build output
- Check that `netlify.toml` redirects are configured correctly

### Cache Issues

- Clear Netlify cache: Site settings > Build & deploy > Post processing > Clear cache
- Force rebuild: Deployments > Trigger deploy > Clear cache and deploy site

## Build Optimization

The production build includes:

- **Output hashing**: For cache busting
- **Budget limits**:
  - Initial bundle: 500kB warning, 1MB error
  - Component styles: 4kB warning, 8kB error
- **Security headers**: X-Frame-Options, X-Content-Type-Options, etc.
- **Cache control**: Immutable assets cached for 1 year

## Support

For issues with:
- **Netlify deployment**: Check [Netlify docs](https://docs.netlify.com/)
- **Angular build**: Check [Angular docs](https://angular.dev/)
- **Application issues**: Create an issue in the GitHub repository
