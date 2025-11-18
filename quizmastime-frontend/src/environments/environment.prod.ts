// Production environment configuration
// NOTE: For Netlify deployment, set the backend API URL as an environment variable
// in the Netlify dashboard under Site settings > Environment variables
// Variable name: NETLIFY_API_URL
// For build-time replacement, you can also use Angular's file replacement in angular.json

export const environment = {
  production: true,
  // TODO: Replace with your actual Railway backend URL
  // Example: 'https://quizmastime-backend-production.up.railway.app/api'
  apiUrl: 'https://quizmastime-production.up.railway.app:8080'
};
