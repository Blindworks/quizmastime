# Google App Engine Standard Deployment Guide

This guide explains how to deploy the QuizmasTime backend to Google App Engine Standard with Cloud SQL.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Google Cloud Setup](#google-cloud-setup)
- [Cloud SQL Setup](#cloud-sql-setup)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Monitoring and Logs](#monitoring-and-logs)
- [Troubleshooting](#troubleshooting)
- [Cost Optimization](#cost-optimization)

## Prerequisites

1. **Google Cloud Account**
   - Create a Google Cloud account at https://cloud.google.com
   - Set up billing (App Engine requires a billing account)

2. **Install Google Cloud SDK**
   ```bash
   # macOS (using Homebrew)
   brew install google-cloud-sdk

   # Linux
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL

   # Windows
   # Download installer from: https://cloud.google.com/sdk/docs/install
   ```

3. **Authenticate with Google Cloud**
   ```bash
   gcloud auth login
   ```

## Google Cloud Setup

### 1. Create a New Project

```bash
# Set your project ID (must be globally unique)
export PROJECT_ID="quizmastime-prod"

# Create the project
gcloud projects create $PROJECT_ID --name="QuizmasTime Production"

# Set as current project
gcloud config set project $PROJECT_ID

# Enable billing (required for App Engine)
# You need to link a billing account through the Console:
# https://console.cloud.google.com/billing
```

### 2. Enable Required APIs

```bash
# Enable App Engine Admin API
gcloud services enable appengine.googleapis.com

# Enable Cloud SQL Admin API
gcloud services enable sqladmin.googleapis.com

# Enable Cloud Build API (for deployment)
gcloud services enable cloudbuild.googleapis.com

# Enable Secret Manager API (for sensitive data)
gcloud services enable secretmanager.googleapis.com
```

### 3. Initialize App Engine

```bash
# Choose your region (e.g., europe-west1, us-central1)
gcloud app create --region=europe-west1
```

**Important:** You cannot change the region after creation!

## Cloud SQL Setup

### 1. Create Cloud SQL Instance

```bash
# Set variables
export INSTANCE_NAME="quizmastime-mysql"
export REGION="europe-west1"
export DB_NAME="quizmastime"
export DB_USER="quizmastime"

# Create Cloud SQL MySQL instance
gcloud sql instances create $INSTANCE_NAME \
  --database-version=MYSQL_8_0 \
  --tier=db-f1-micro \
  --region=$REGION \
  --root-password="YOUR_STRONG_ROOT_PASSWORD" \
  --backup \
  --backup-start-time=03:00

# Wait for instance to be created (this can take several minutes)
gcloud sql instances list
```

**Instance Tiers:**
- `db-f1-micro`: 1 shared vCPU, 614 MB RAM (cheapest, suitable for development/testing)
- `db-g1-small`: 1 shared vCPU, 1.7 GB RAM
- `db-n1-standard-1`: 1 vCPU, 3.75 GB RAM (recommended for production)

### 2. Create Database and User

```bash
# Create database
gcloud sql databases create $DB_NAME --instance=$INSTANCE_NAME

# Create user with password
gcloud sql users create $DB_USER \
  --instance=$INSTANCE_NAME \
  --password="YOUR_STRONG_DB_PASSWORD"
```

### 3. Get Connection Name

```bash
# Get the connection name (format: project:region:instance)
gcloud sql instances describe $INSTANCE_NAME --format="value(connectionName)"

# Example output: quizmastime-prod:europe-west1:quizmastime-mysql
```

Save this connection name - you'll need it for configuration!

### 4. Store Database Password in Secret Manager

```bash
# Create secret for database password
echo -n "YOUR_STRONG_DB_PASSWORD" | gcloud secrets create db-password --data-file=-

# Grant App Engine service account access to the secret
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding db-password \
  --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## Configuration

### 1. Update app.yaml

Edit `quizmastime-backend/app.yaml`:

```yaml
env_variables:
  # Your Netlify frontend URL
  CORS_ALLOWED_ORIGINS: "https://your-app.netlify.app"

  # Cloud SQL connection name from step above
  CLOUD_SQL_CONNECTION_NAME: "quizmastime-prod:europe-west1:quizmastime-mysql"

  # Database configuration
  DB_NAME: "quizmastime"
  DB_USER: "quizmastime"
  # DB_PASSWORD is loaded from Secret Manager (see next step)
```

### 2. Load Secrets at Runtime

There are two ways to handle the database password:

#### Option A: Secret Manager (Recommended)

Update `app.yaml` to include:

```yaml
env_variables:
  DB_PASSWORD: "YOUR_DB_PASSWORD"  # Not recommended for production
```

Or use Secret Manager integration (recommended):

Create `quizmastime-backend/src/main/java/com/quizmastime/backend/config/SecretManagerConfig.java`:

```java
package com.quizmastime.backend.config;

import com.google.cloud.secretmanager.v1.AccessSecretVersionResponse;
import com.google.cloud.secretmanager.v1.SecretManagerServiceClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;

@Configuration
public class SecretManagerConfig {

    @Value("${spring.cloud.gcp.project-id:}")
    private String projectId;

    public String getSecret(String secretId) {
        try (SecretManagerServiceClient client = SecretManagerServiceClient.create()) {
            String secretName = String.format(
                "projects/%s/secrets/%s/versions/latest",
                projectId,
                secretId
            );
            AccessSecretVersionResponse response = client.accessSecretVersion(secretName);
            return response.getPayload().getData().toStringUtf8();
        } catch (Exception e) {
            throw new RuntimeException("Failed to access secret: " + secretId, e);
        }
    }
}
```

#### Option B: Environment Variables (Simpler, less secure)

Just set `DB_PASSWORD` in `app.yaml` env_variables section.

For this guide, we'll use Option B for simplicity. Update `app.yaml`:

```yaml
env_variables:
  DB_PASSWORD: "your_database_password_here"
```

### 3. Verify Configuration Files

Ensure these files exist:
- ✅ `app.yaml` - App Engine configuration
- ✅ `src/main/resources/application-appengine.properties` - Spring Boot profile for App Engine
- ✅ `.gcloudignore` - Files to exclude from deployment
- ✅ `pom.xml` - Updated with Cloud SQL Socket Factory dependency

## Deployment

### 1. Build the Application Locally (Optional)

```bash
cd quizmastime-backend

# Build and test
./mvnw clean package

# Verify JAR was created
ls -lh target/*.jar
```

### 2. Deploy to App Engine

```bash
# From quizmastime-backend directory
gcloud app deploy app.yaml

# You'll be prompted to confirm
# Service [default] will be deployed to [https://PROJECT_ID.REGION_ID.r.appspot.com]
# Do you want to continue (Y/n)? Y
```

**Deployment Process:**
1. Code is uploaded to Cloud Storage
2. Cloud Build builds your application
3. App Engine deploys the new version
4. Previous version remains available (can rollback if needed)

### 3. Verify Deployment

```bash
# View deployment status
gcloud app versions list

# Open the application in browser
gcloud app browse

# Or manually visit:
# https://PROJECT_ID.REGION_ID.r.appspot.com
```

### 4. Test Your API

```bash
# Test health/status endpoint
curl https://PROJECT_ID.REGION_ID.r.appspot.com/actuator/health

# Test your API endpoints
curl https://PROJECT_ID.REGION_ID.r.appspot.com/api/your-endpoint
```

## Monitoring and Logs

### View Logs

```bash
# Stream logs in real-time
gcloud app logs tail -s default

# View logs in Cloud Console
gcloud app logs read --limit=100

# Or visit: https://console.cloud.google.com/logs
```

### Monitoring Dashboard

1. Go to: https://console.cloud.google.com/appengine
2. Click on "Dashboard" to see:
   - Request rate
   - Latency
   - Errors
   - Instance count
   - Memory usage

### Cloud SQL Monitoring

```bash
# View Cloud SQL instance details
gcloud sql instances describe $INSTANCE_NAME

# Monitor connections
gcloud sql operations list --instance=$INSTANCE_NAME
```

## Troubleshooting

### Common Issues

#### 1. "Cloud SQL connection failed"

**Symptoms:** Application can't connect to Cloud SQL

**Solutions:**
```bash
# Verify Cloud SQL connection name
gcloud sql instances describe $INSTANCE_NAME --format="value(connectionName)"

# Check if App Engine service account has access
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --format="table(bindings.role)" \
  --filter="bindings.members:$PROJECT_ID@appspot.gserviceaccount.com"

# Grant Cloud SQL Client role to App Engine service account
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/cloudsql.client"
```

#### 2. "Out of Memory" Errors

**Solution:** Increase instance class in `app.yaml`:
```yaml
instance_class: F4  # or F4_1G for 2GB RAM
```

#### 3. "Too Many Connections" to MySQL

**Solutions:**
```bash
# Increase max connections in Cloud SQL
gcloud sql instances patch $INSTANCE_NAME \
  --database-flags=max_connections=100

# Or reduce connection pool in application-appengine.properties
spring.datasource.hikari.maximum-pool-size=3
```

#### 4. Slow Cold Starts

**Solutions:**
- Use F2 or F4 instance class (faster than F1)
- Set `min_instances: 1` in `app.yaml` to keep one instance warm
- Optimize application startup time

#### 5. CORS Errors

**Check:**
```bash
# Verify CORS_ALLOWED_ORIGINS in app.yaml matches your frontend URL
# Example: https://quizmastime.netlify.app (no trailing slash!)
```

### Debug Mode

Enable detailed logging:

```yaml
# In app.yaml
env_variables:
  JPA_SHOW_SQL: "true"
  LOGGING_LEVEL_ROOT: "DEBUG"
```

Redeploy after changes:
```bash
gcloud app deploy
```

## Cost Optimization

### 1. Instance Configuration

**Development/Testing:**
```yaml
instance_class: F1
automatic_scaling:
  min_instances: 0  # Scale to zero when idle
  max_instances: 2
```

**Production:**
```yaml
instance_class: F2
automatic_scaling:
  min_instances: 1  # Keep one instance warm
  max_instances: 5
```

### 2. Cloud SQL Optimization

```bash
# Use smallest tier for development
# db-f1-micro: ~$7-10/month

# Enable automatic backups (important!)
gcloud sql instances patch $INSTANCE_NAME \
  --backup-start-time=03:00

# Set maintenance window
gcloud sql instances patch $INSTANCE_NAME \
  --maintenance-window-day=SUN \
  --maintenance-window-hour=3
```

### 3. Monitor Costs

```bash
# View current billing
gcloud billing accounts list

# Set up budget alerts in Cloud Console:
# https://console.cloud.google.com/billing/budgets
```

### Estimated Monthly Costs (EU region)

- **App Engine F1 (minimal traffic):** $0-5
- **App Engine F2 (moderate traffic):** $10-30
- **Cloud SQL db-f1-micro:** $7-10
- **Cloud SQL db-n1-standard-1:** $50-80
- **Networking (egress):** $0.12/GB

**Total Development:** ~$15-20/month
**Total Production:** ~$70-120/month

## Useful Commands Reference

```bash
# Deploy new version
gcloud app deploy

# List versions
gcloud app versions list

# Route all traffic to specific version
gcloud app versions migrate VERSION_ID

# Delete old versions
gcloud app versions delete VERSION_ID

# View current app
gcloud app describe

# Stop/Start Cloud SQL
gcloud sql instances patch $INSTANCE_NAME --activation-policy=NEVER
gcloud sql instances patch $INSTANCE_NAME --activation-policy=ALWAYS

# Backup Cloud SQL
gcloud sql backups create --instance=$INSTANCE_NAME

# Restore from backup
gcloud sql backups restore BACKUP_ID --backup-instance=$INSTANCE_NAME
```

## Security Best Practices

1. **Never commit secrets to git**
   - Use Secret Manager or environment variables
   - Add `.env` files to `.gitignore`

2. **Use HTTPS only**
   - App Engine enforces HTTPS by default
   - Set `secure: always` in `app.yaml`

3. **Restrict CORS origins**
   - Only allow your frontend domain
   - Never use `*` in production

4. **Enable Cloud SQL SSL**
   ```bash
   gcloud sql instances patch $INSTANCE_NAME --require-ssl
   ```

5. **Regular backups**
   - Automated daily backups enabled by default
   - Test restore process periodically

6. **Monitor and alert**
   - Set up error rate alerts
   - Monitor unusual traffic patterns
   - Review Cloud SQL connection counts

## Next Steps

1. **Set up CI/CD Pipeline**
   - Use Cloud Build to automate deployments
   - Deploy on git push to main branch

2. **Custom Domain**
   ```bash
   gcloud app domain-mappings create www.quizmastime.com
   ```

3. **CDN and Performance**
   - Enable Cloud CDN for static assets
   - Use Cloud Storage for file uploads

4. **Staging Environment**
   - Create separate project for staging
   - Test deployments before production

## Support and Resources

- **App Engine Documentation:** https://cloud.google.com/appengine/docs/standard/java-gen2
- **Cloud SQL Documentation:** https://cloud.google.com/sql/docs
- **Pricing Calculator:** https://cloud.google.com/products/calculator
- **Community Support:** https://stackoverflow.com/questions/tagged/google-app-engine

---

**Last Updated:** 2025-11-19
**Maintained by:** QuizmasTime Development Team
