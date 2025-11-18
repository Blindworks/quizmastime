# Railway Deployment Guide

This document provides instructions for deploying the QuizmasTime backend to Railway.

## Prerequisites

1. A Railway account (sign up at https://railway.app)
2. MySQL database provisioned on Railway
3. GitHub repository connected to Railway

## Railway Configuration

### 1. Create a New Project

1. Go to Railway dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose the `quizmastime` repository
5. Select the backend service

### 2. Add MySQL Database

1. In your Railway project, click "New"
2. Select "Database" → "Add MySQL"
3. Railway will automatically provision a MySQL database
4. Note: Railway will automatically inject database connection variables

### 3. Configure Environment Variables

Set the following environment variables in Railway:

#### Required Variables

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `PORT` | Server port (auto-provided by Railway) | `8080` |
| `MYSQL_URL` | MySQL JDBC connection URL (auto-provided) | `jdbc:mysql://host:3306/railway` |
| `MYSQL_USER` | MySQL username (auto-provided) | `root` |
| `MYSQL_PASSWORD` | MySQL password (auto-provided) | `***` |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins (your frontend URL) | `https://your-app.netlify.app` |

#### Optional Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `JPA_DDL_AUTO` | Hibernate DDL auto mode | `update` |
| `JPA_SHOW_SQL` | Show SQL queries in logs | `false` (recommended for production) |
| `QUIZ_LOCKOUT_DURATION` | Lockout duration in minutes after wrong answer | `30` |

### 4. Configure Root Directory (Important!)

Since the backend is in a subdirectory:

1. Go to your service settings in Railway
2. Click on "Settings"
3. Under "Build", set:
   - **Root Directory**: `quizmastime-backend`
4. Railway will now build from the backend directory

### 5. Configure CORS

⚠️ **Important**: Update `CORS_ALLOWED_ORIGINS` with your actual frontend URL:

```
CORS_ALLOWED_ORIGINS=https://your-frontend-app.netlify.app
```

For multiple origins, separate with commas:

```
CORS_ALLOWED_ORIGINS=https://app1.netlify.app,https://app2.netlify.app
```

### 6. Database Connection

Railway's MySQL service automatically provides these environment variables:
- `MYSQL_URL` - Full JDBC connection URL
- `MYSQL_HOST` - Database host
- `MYSQL_PORT` - Database port (usually 3306)
- `MYSQL_DATABASE` - Database name
- `MYSQL_USER` - Database username
- `MYSQL_PASSWORD` - Database password

The application is configured to use these variables automatically. No manual configuration needed!

## Build Configuration

The project includes a `nixpacks.toml` file that configures:
- Java 21 runtime
- Maven build with `./mvnw clean package -DskipTests`
- Startup command to run the JAR file

## Deployment Process

1. Push your code to GitHub
2. Railway automatically detects changes and starts deployment
3. Build logs will show the Maven build process
4. Once deployed, your application will be available at the Railway-provided URL

## Monitoring

- View logs in Railway dashboard under "Deployments" → "View Logs"
- Check application health at: `https://your-railway-url.up.railway.app/api/health` (if health endpoint is implemented)

## Troubleshooting

### Build Fails

- Check that Java 21 is specified in `nixpacks.toml`
- Verify Maven wrapper (`mvnw`) has execute permissions
- Review build logs for specific errors

### Database Connection Issues

- Verify MySQL service is running in Railway
- Check that environment variables are correctly set
- Ensure `MYSQL_URL` format includes `jdbc:mysql://` prefix

### CORS Errors

- Verify `CORS_ALLOWED_ORIGINS` is set to your frontend URL
- Include the protocol (`https://`) in the URL
- Check that the frontend is using the correct backend URL

### Port Issues

- Railway automatically sets the `PORT` variable
- The application is configured to use `${PORT:8080}`
- Do not hardcode port 8080 in production

## Security Notes

⚠️ **Production Settings**:
- Set `JPA_SHOW_SQL=false` to avoid logging sensitive data
- Use strong database passwords (Railway generates these automatically)
- Keep `JPA_DDL_AUTO=update` or `validate` (never use `create-drop` in production)
- Ensure CORS origins are explicitly set (never use `*` in production)

## Rollback

To rollback to a previous deployment:
1. Go to "Deployments" in Railway dashboard
2. Find the working deployment
3. Click "Redeploy"

## Support

- Railway Documentation: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
