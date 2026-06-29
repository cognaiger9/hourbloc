# Railway Deployment Guide

This guide walks through deploying the HourBloc API (FastAPI + Supabase) to Railway.

## Prerequisites

- [Railway account](https://railway.app/) (free tier available)
- [Railway CLI](https://docs.railway.app/develop/cli) (optional, for CLI deployments)
- Supabase project with your database tables created
- GitHub repository with your code (recommended for auto-deployments)

## Quick Start

### Option 1: Deploy from GitHub (Recommended)

1. **Connect Railway to GitHub**
   - Go to [railway.app](https://railway.app/) and sign in
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Select the `backend` directory as the root (if monorepo)

2. **Configure Build Settings**
   - Railway will auto-detect Python and use Nixpacks
   - Or create a `Dockerfile` for custom configuration (see below)

3. **Set Environment Variables** (see section below)

4. **Deploy**
   - Railway will automatically deploy on push to main branch

### Option 2: Deploy using Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Link to existing project or create new one
railway link
# or
railway init

# Set environment variables
railway variables set SUPABASE_URL="your-url"
railway variables set SUPABASE_KEY="your-anon-key"
# ... (see all variables below)

# Deploy
railway up
```

## Dockerfile (Optional but Recommended)

Create a `Dockerfile` in the `backend/` directory for consistent deployments:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (Railway will set PORT env var)
EXPOSE 8000

# Run the application
CMD uvicorn main:app --host 0.0.0.0 --port $PORT
```

## Environment Variables

Configure these in Railway dashboard under your service → Variables:

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `SUPABASE_KEY` | Supabase anon/public key | `eyJhbGci...` |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (admin) | `eyJhbGci...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PROJECT_NAME` | API project name | `HourBloc API` |
| `VERSION` | API version | `1.0.0` |
| `API_V1_STR` | API version prefix | `/api/v1` |
| `BACKEND_CORS_ORIGINS` | Comma-separated allowed origins | `https://yourdomain.com` |
| `PORT` | Server port (auto-set by Railway) | `8000` |

### Setting CORS Origins

For production, update `BACKEND_CORS_ORIGINS` to include your frontend domain:

```bash
BACKEND_CORS_ORIGINS=https://your-frontend.vercel.app,https://your-domain.com
```

### Setting Variables in Railway Dashboard

1. Go to your project → Select your service
2. Click "Variables" tab
3. Click "New Variable"
4. Add each variable from the table above
5. Click "Deploy" to apply changes

### Setting Variables via CLI

```bash
railway variables set SUPABASE_URL="https://xxxxx.supabase.co"
railway variables set SUPABASE_KEY="your-anon-key"
railway variables set SUPABASE_SERVICE_KEY="your-service-key"
railway variables set BACKEND_CORS_ORIGINS="https://yourdomain.com"
```

## Railway Configuration File (Optional)

Create `railway.toml` in the `backend/` directory for advanced configuration:

```toml
[build]
builder = "NIXPACKS"
# or if using Dockerfile:
# builder = "DOCKERFILE"
# dockerfilePath = "Dockerfile"

[deploy]
startCommand = "uvicorn main:app --host 0.0.0.0 --port $PORT"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

## Deployment Steps

### First-Time Deployment

1. **Push your code to GitHub** (if using GitHub deployment)

2. **Create Railway project**
   ```bash
   railway init
   ```
   Or use the Railway dashboard

3. **Set all environment variables**
   - Via CLI: `railway variables set KEY=value`
   - Via Dashboard: Project → Variables → New Variable

4. **Deploy**
   ```bash
   railway up
   ```
   Or push to GitHub (if using GitHub integration)

5. **Generate domain**
   - Railway auto-generates a domain: `your-service.railway.app`
   - Or add custom domain: Settings → Domains → Add Domain

6. **Verify deployment**
   ```bash
   curl https://your-service.railway.app/health
   curl https://your-service.railway.app/health/supabase
   ```

### Subsequent Deployments

If using GitHub integration:
- Push to your main branch → Railway auto-deploys

If using CLI:
```bash
railway up
```

## Health Checks

Your API includes health check endpoints:

- **Basic health check**: `GET /health`
  ```json
  {"status": "healthy"}
  ```

- **Supabase connection check**: `GET /health/supabase`
  ```json
  {
    "status": "connected",
    "supabase_url": "https://xxxxx.supabase.co"
  }
  ```

Configure Railway health checks:
1. Go to Settings → Health Checks
2. Set path to `/health`
3. Expected status code: `200`

## Monitoring & Logs

### View Logs

**Via Dashboard:**
- Go to your service → Deployments → Click deployment → View Logs

**Via CLI:**
```bash
railway logs
```

### Metrics

Railway provides built-in metrics:
- CPU usage
- Memory usage
- Network traffic
- Deployment history

Access via: Project → Service → Metrics tab

## Troubleshooting

### Common Issues

#### 1. Application Not Starting

**Symptom:** Deployment fails or crashes immediately

**Solutions:**
- Check logs: `railway logs`
- Verify all required environment variables are set
- Ensure `PORT` variable is used correctly (Railway sets this automatically)
- Check `requirements.txt` includes all dependencies

#### 2. Supabase Connection Issues

**Symptom:** `/health/supabase` returns error

**Solutions:**
- Verify `SUPABASE_URL` and `SUPABASE_KEY` are correct
- Check Supabase project is accessible (not paused)
- Ensure service role key is valid (if using admin operations)

#### 3. CORS Errors

**Symptom:** Frontend can't connect to API

**Solutions:**
- Add your frontend domain to `BACKEND_CORS_ORIGINS`
- Format: comma-separated, include protocol: `https://app.com,https://www.app.com`
- Redeploy after changing environment variables

#### 4. Module Import Errors

**Symptom:** `ModuleNotFoundError` in logs

**Solutions:**
- Ensure all dependencies are in `requirements.txt`
- Check Python version compatibility (Railway uses Python 3.11 by default)
- If using Dockerfile, verify COPY commands include all necessary files

#### 5. Port Binding Issues

**Symptom:** "Address already in use" or similar

**Solutions:**
- Ensure you're using Railway's `$PORT` environment variable:
  ```python
  # Don't hardcode port 8000
  # Instead, use $PORT from environment
  ```
- Update start command to: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Debug Commands

```bash
# View environment variables
railway variables

# View service status
railway status

# View recent logs
railway logs

# SSH into running container (for debugging)
railway shell

# Open service in browser
railway open
```

## Production Checklist

Before going to production:

- [ ] Set production `BACKEND_CORS_ORIGINS` (remove localhost)
- [ ] Use strong `SECRET_KEY` (generate with `openssl rand -hex 32`)
- [ ] Review Supabase Row Level Security (RLS) policies
- [ ] Enable HTTPS (Railway provides this automatically)
- [ ] Set up custom domain (optional)
- [ ] Configure health checks in Railway
- [ ] Set up monitoring/alerting
- [ ] Review and optimize `ACCESS_TOKEN_EXPIRE_MINUTES`
- [ ] Test all API endpoints in production
- [ ] Set up automatic backups for Supabase
- [ ] Review Railway resource limits for your plan

## Scaling

Railway offers various plans with different resources:

### Free Tier
- $5 credit/month
- Up to 512MB RAM
- Shared CPU

### Hobby Plan
- $5/month (base)
- Pay for usage above free credits
- More CPU/RAM available

### Pro Plan
- $20/month
- Higher limits
- Priority support

To scale your service:
1. Go to Project → Settings → Resources
2. Adjust CPU/Memory limits
3. Enable autoscaling (Pro plan)

## CI/CD with GitHub Actions

For additional checks before Railway deployment, create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Railway

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd backend
          # Add your test commands here
          # pytest tests/

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          # Railway auto-deploys on push to main
          # This job is just for confirmation
          echo "Deploying to Railway..."
```

## Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)
- [Supabase Documentation](https://supabase.com/docs)
- [Railway Python Template](https://github.com/railwayapp/examples/tree/main/examples/python)

## Support

- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Railway Status: [status.railway.app](https://status.railway.app)
- Railway Docs: [docs.railway.app](https://docs.railway.app)
