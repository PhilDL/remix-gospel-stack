# Deployment Guide

This guide covers deploying your React Router Gospel Stack application to Fly.io with Docker. Choose the section that matches your database setup.

> **⚠️ Important:** All commands should be run from the **monorepo root directory** unless specified otherwise.

## Prerequisites

- [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/) installed
- A Fly.io account
- Git repository set up
- GitHub account (for CI/CD)

## Initial Fly.io Setup

These steps are common to both PostgreSQL and Turso deployments.

### 1. Sign Up and Authenticate

```bash
fly auth signup
# or if you already have an account
fly auth login
```

### 2. Create Fly Applications

Create two apps: one for production and one for staging.

```bash
fly apps create react-router-gospel-stack
fly apps create react-router-gospel-stack-staging
```

> **Note:** Replace `react-router-gospel-stack` with your desired app name. These names must be globally unique on Fly.io.

### 3. Verify fly.toml Configuration

Check the `apps/webapp/fly.toml` file and ensure the `app` name matches your production app:

```toml
app = "react-router-gospel-stack"  # Must match your production app name
primary_region = "cdg"  # Change to your preferred region
```

> **Important:** The stack automatically appends a unique suffix during init, which may not match the apps you created. Update the `app` value if needed.

### 4. Initialize Git Repository

```bash
git init
```

### 5. Connect to GitHub

Create a new [GitHub Repository](https://repo.new), then add it as the remote:

```bash
git remote add origin <ORIGIN_URL>
```

**Do not push yet!** Complete the setup first.

### 6. Add Fly API Token to GitHub

1. Go to [Fly.io Personal Access Tokens](https://web.fly.io/user/personal_access_tokens/new)
2. Create a new token
3. Add it to your [GitHub repo secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets) with the name `FLY_API_TOKEN`

## PostgreSQL Deployment

> For PostgreSQL setup details, see the [Database Guide](./database.md#postgresql-setup).

### 1. Create PostgreSQL Databases

Create databases for both environments:

```bash
# Production database
fly postgres create --name react-router-gospel-stack-db --region cdg

# Staging database
fly postgres create --name react-router-gospel-stack-staging-db --region cdg
```

Choose the appropriate configuration when prompted (Development, Production, or High Availability).

### 2. Attach Databases to Apps

```bash
# Attach production database
fly postgres attach react-router-gospel-stack-db --app react-router-gospel-stack

# Attach staging database
fly postgres attach react-router-gospel-stack-staging-db --app react-router-gospel-stack-staging
```

This automatically sets the `DATABASE_URL` secret in your apps.

### 3. Run Initial Migration

Before your first deployment, apply the migrations:

```bash
# Get a connection string
fly postgres connect --app react-router-gospel-stack-db

# In another terminal, run migrations
DATABASE_URL="<connection-string>" pnpm run db:migrate
```

### 4. Deploy!

Commit and push your changes:

```bash
git add .
git commit -m "Initial commit"
git push -u origin main
```

Pushing to `main` triggers the GitHub Action that deploys to production. Pushing to `dev` deploys to staging.

### Multi-Region PostgreSQL

To scale your PostgreSQL database across regions:

1. Read [Fly's Multi-region PostgreSQL guide](https://fly.io/docs/getting-started/multi-region-databases/)
2. Set the `PRIMARY_REGION` environment variable:
   ```bash
   fly secrets set PRIMARY_REGION=cdg --app react-router-gospel-stack
   ```

## Turso Deployment

> For Turso setup details and concepts, see the [Database Guide](./database.md#turso-setup).

Turso uses embedded replicas for optimal performance—a local SQLite file that syncs with the remote Turso database.

### 1. Install and Login to Turso

```bash
curl -sSfL https://get.tur.so/install.sh | bash
turso auth login
```

### 2. Select Your Organization

```bash
turso org list
turso org switch <organization-name>
```

### 3. Create Database Groups and Databases

```bash
# Create groups
turso group create production-group
turso group create staging-group

# Create databases
turso db create react-router-gospel-stack-db --group production-group
turso db create react-router-gospel-stack-staging-db --group staging-group
```

### 4. Get Database Credentials

```bash
# Production
turso db show --url react-router-gospel-stack-db
turso db tokens create react-router-gospel-stack-db

# Staging
turso db show --url react-router-gospel-stack-staging-db
turso db tokens create react-router-gospel-stack-staging-db
```

Save these values for the next step.

### 5. Apply Migrations

**With Drizzle:**

```bash
# Apply directly to remote Turso database
pnpm db:migrate:production
```

**With Prisma:**

Apply migrations manually (Prisma cannot apply automatically to Turso):

```bash
turso db shell react-router-gospel-stack-db < packages/infrastructure/prisma/migrations/<migration-folder>/migration.sql
turso db shell react-router-gospel-stack-staging-db < packages/infrastructure/prisma/migrations/<migration-folder>/migration.sql
```

### 6. Create Persistent Volumes

Embedded replicas need persistent storage on Fly.io:

```bash
# Production volume
fly volumes create libsql_data --region cdg --size 1 --app react-router-gospel-stack

# Staging volume
fly volumes create libsql_data --region cdg --size 1 --app react-router-gospel-stack-staging
```

> **Note:** Change the `--region` to match your `primary_region` in `fly.toml`. Adjust `--size` (in GB) based on your needs.

### 7. Set Secrets in Fly Apps

Set the environment variables for embedded replicas:

**Production:**

```bash
fly secrets set \
  DATABASE_URL="file:/data/libsql/local.db" \
  DATABASE_SYNC_URL="<production-database-sync-url>" \
  DATABASE_AUTH_TOKEN="<production-auth-token>" \
  --app react-router-gospel-stack
```

**Staging:**

```bash
fly secrets set \
  DATABASE_URL="file:/data/libsql/local.db" \
  DATABASE_SYNC_URL="<staging-database-sync-url>" \
  DATABASE_AUTH_TOKEN="<staging-auth-token>" \
  --app react-router-gospel-stack-staging
```

> **Important:**
>
> - `DATABASE_URL` is the local file path for the embedded replica
> - `DATABASE_SYNC_URL` is the remote Turso database URL
> - `DATABASE_AUTH_TOKEN` is the Turso authentication token

### 8. Deploy!

Commit and push your changes:

```bash
git add .
git commit -m "Initial commit"
git push -u origin main
```

The GitHub Action will build and deploy your app to production. Push to `dev` branch to deploy to staging.

### Turso Embedded Replicas

With the above configuration, your app uses Turso's embedded replicas for optimal performance. See the [Database Guide](./database.md#embedded-replicas) for details on how this works.

Learn more: [Turso Embedded Replicas on Fly.io](https://docs.turso.tech/features/embedded-replicas/with-fly)

## GitHub Actions CI/CD

The stack includes GitHub Actions workflows for automated deployments.

### Workflow Overview

- **Push to `main`** → Deploy to production
- **Push to `dev`** → Deploy to staging
- **Pull requests** → Run tests and linting

### Workflow Files

Located in `.github/workflows/`:

- `deploy-production.yml` - Production deployment
- `deploy-staging.yml` - Staging deployment

### Required Secrets

Ensure these secrets are set in your GitHub repository:

- `FLY_API_TOKEN` - Your Fly.io API token

### Customizing Workflows

Edit the workflow files to customize:

- Test commands
- Build steps
- Deployment regions
- Environment variables

## Manual Deployment

If you prefer to deploy manually without GitHub Actions:

### Build Docker Image Locally

```bash
# Build the webapp image
pnpm docker:build:webapp

# Run it locally to test
pnpm docker:run:webapp
```

### Deploy to Fly.io Manually

```bash
# Deploy to production
DOCKER_DEFAULT_PLATFORM=linux/amd64 flyctl deploy \
  --config ./apps/webapp/fly.toml \
  --dockerfile ./apps/webapp/Dockerfile

# Deploy to staging
DOCKER_DEFAULT_PLATFORM=linux/amd64 flyctl deploy \
  --config ./apps/webapp/fly.toml \
  --app react-router-gospel-stack-staging \
  --dockerfile ./apps/webapp/Dockerfile
```

## Multi-Region Deployment

Once your app is running in a single region, you can scale to multiple regions for better global performance.

### 1. Add More Regions

```bash
# Scale your app to multiple regions
fly scale count 3 --region cdg,iad,syd --app react-router-gospel-stack
```

### 2. Set Primary Region

Set the primary region environment variable:

```bash
fly secrets set PRIMARY_REGION=cdg --app react-router-gospel-stack
```

This should match the `primary_region` in your `fly.toml`:

```toml
primary_region = "cdg"
```

### 3. Database Considerations

**PostgreSQL:**

- Follow [Fly's Multi-region PostgreSQL guide](https://fly.io/docs/getting-started/multi-region-databases/)
- Set up read replicas in additional regions

**Turso:**

- Turso automatically distributes reads globally
- No additional setup needed—embedded replicas handle it

### Testing Different Regions

To test your app from different regions:

1. Install [ModHeader](https://modheader.com/) browser extension
2. Add header: `fly-prefer-region` with value like `iad`, `cdg`, `syd`
3. Check the response header `x-fly-region` to confirm which region handled your request

Available regions: [Fly.io Regions List](https://fly.io/docs/reference/regions/)

## Health Checks

The stack includes a health check endpoint at `/healthcheck`.

In `fly.toml`:

```toml
[[services.http_checks]]
  grace_period = "10s"
  interval = "30s"
  method = "GET"
  timeout = "5s"
  path = "/healthcheck"
```

This enables:

- Automatic failover to healthy instances
- Zero-downtime deployments
- Region fallbacks

## Monitoring and Logs

### View Logs

```bash
# Tail production logs
fly logs --app react-router-gospel-stack

# Tail staging logs
fly logs --app react-router-gospel-stack-staging
```

### Monitor App Status

```bash
# Check app status
fly status --app react-router-gospel-stack

# View app info
fly info --app react-router-gospel-stack
```

### Fly.io Dashboard

Visit [fly.io/dashboard](https://fly.io/dashboard) for:

- Metrics and monitoring
- Log exploration
- App configuration
- Billing information

## Troubleshooting

### Deployment Fails

1. Check GitHub Actions logs for errors
2. Verify all secrets are set correctly
3. Ensure `fly.toml` app name matches your Fly app
4. Check Fly.io logs: `fly logs --app <app-name>`

### Database Connection Issues

**PostgreSQL:**

```bash
# Test connection
fly postgres connect --app react-router-gospel-stack-db
```

**Turso:**

```bash
# Test connection
turso db shell <database-name>

# Verify tokens
turso db tokens validate <token> --db <database-name>
```

### 404 Errors in GitHub Actions

This usually means the app name in `fly.toml` doesn't match the actual Fly app name. Update `fly.toml`:

```toml
app = "your-actual-app-name"
```

### Volume Issues (Turso)

If your embedded replica volume has issues:

```bash
# List volumes
fly volumes list --app react-router-gospel-stack

# Delete and recreate if needed
fly volumes delete <volume-id> --app react-router-gospel-stack
fly volumes create libsql_data --region cdg --size 1 --app react-router-gospel-stack
```

### Applying New Migrations

For migration workflows, see the [Database Guide](./database.md#migrations-with-drizzle).

**Quick reference:**

- **PostgreSQL:** Migrations are automatically applied during deployment by the GitHub Action
- **Turso with Drizzle:** `pnpm db:migrate:production`
- **Turso with Prisma:** Apply manually using `turso db shell`

## Security Best Practices

1. **Never commit secrets** - Use Fly secrets and GitHub secrets
2. **Use staging environment** - Test changes before production
3. **Enable 2FA** - On both Fly.io and GitHub accounts
4. **Rotate tokens** - Regularly rotate API tokens and database credentials
5. **Review logs** - Monitor for suspicious activity

## Cost Optimization

- **Use autoscaling** - Scale down during low traffic
- **Choose appropriate regions** - Fewer regions = lower cost
- **Monitor usage** - Use Fly.io dashboard to track spending
- **Optimize images** - Smaller Docker images = faster deploys and lower egress

## Next Steps

- Set up monitoring and alerting
- Configure custom domains
- Implement automated backups
- Set up staging environment workflow
- Review the [Architecture](./architecture.md) for scaling strategies

## Useful Links

- [Fly.io Documentation](https://fly.io/docs/)
- [Fly.io Scaling Guide](https://fly.io/docs/reference/scaling/)
- [Turso Documentation](https://docs.turso.tech/)
- [Fly.io Support Community](https://community.fly.io/)
