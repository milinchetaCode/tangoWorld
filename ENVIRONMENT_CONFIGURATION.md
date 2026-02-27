# Environment Configuration Guide

This document describes the environment configuration setup for the TangoWorld application, specifically tailored for deployment on render.com.

## Overview

The application uses environment variables for configuration, with validation at startup to ensure all required variables are present and correctly formatted.

## Backend Configuration

### Required Environment Variables

The backend requires the following environment variables:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:password@host:5432/db?schema=public` |
| `JWT_SECRET` | Yes | Secret key for JWT token signing (32+ chars recommended) | Generated with `openssl rand -base64 32` |
| `PORT` | No | Port the application listens on (default: 3001) | `3001` |
| `NODE_ENV` | No | Environment mode (default: development) | `development`, `production`, or `test` |

### Local Development Setup

1. Copy the example environment file:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Edit `.env` and fill in your configuration values:
   ```bash
   DATABASE_URL=postgresql://postgres:password@localhost:5432/tangoworld?schema=public
   JWT_SECRET=$(openssl rand -base64 32)
   PORT=3001
   NODE_ENV=development
   ```

3. The application will validate environment variables at startup and fail with clear error messages if any required variables are missing.

### Configuration Architecture

The backend uses:
- **@nestjs/config**: NestJS configuration module for managing environment variables
- **joi**: Schema validation to ensure all required variables are present and correctly formatted
- **ConfigService**: Injected into modules and services to access configuration

Configuration files:
- `src/config/configuration.ts`: Loads and exports configuration
- `src/config/validation.schema.ts`: Joi schema for validating environment variables
- `src/app.module.ts`: Imports ConfigModule with global scope

### Validation

Environment validation happens at application startup. If validation fails:
- The application will not start
- A clear error message will indicate which variables are missing or invalid
- Example error: `Config validation error: "DATABASE_URL" is required. "JWT_SECRET" is required`

## Frontend Configuration

### Required Environment Variables

The frontend requires the following environment variables:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL | `http://localhost:3001` (dev) or `https://tango-backend.onrender.com` (prod) |

### Local Development Setup

1. Copy the example environment file:
   ```bash
   cd frontend
   cp .env.example .env.local
   ```

2. Edit `.env.local`:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

### Important Notes

- All `NEXT_PUBLIC_*` variables are embedded in the build and exposed to the browser
- Never put sensitive secrets in `NEXT_PUBLIC_*` variables
- The frontend reads `NEXT_PUBLIC_API_URL` in `src/lib/api.ts`

## Render.com Deployment

### Configuration via render.yaml

The `render.yaml` file contains the complete deployment configuration for render.com:

#### Backend Service
```yaml
envVars:
  - key: DATABASE_URL
    # Set in Render Dashboard, typically from a PostgreSQL service
  - key: JWT_SECRET
    generateValue: true  # Render generates a secure random value
  - key: NODE_ENV
    value: production
  # PORT is automatically set by Render
```

#### Frontend Service
```yaml
envVars:
  - key: NEXT_PUBLIC_API_URL
    fromService:
      name: tango-backend
      type: web
      property: url  # Automatically uses the backend service URL
```

### Setting Environment Variables in Render Dashboard

1. **Database URL**: 
   - Create a PostgreSQL service in Render
   - Copy the Internal Database URL
   - Set as `DATABASE_URL` in the backend service

2. **JWT Secret**:
   - Use Render's "Generate Value" feature (already configured in render.yaml)
   - Or manually set a secure random value

3. **Frontend API URL**:
   - Automatically configured in render.yaml to use backend service URL
   - No manual configuration needed

### Deployment Workflow

1. Push changes to GitHub
2. Render automatically builds and deploys both services
3. Environment variables are injected during build and runtime
4. Application validates configuration at startup
5. If validation fails, deployment fails with clear error messages

## Security Best Practices

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use strong JWT secrets** - Generate with `openssl rand -base64 32`
3. **Use Render's secret management** - Use "Generate Value" for JWT_SECRET
4. **Rotate secrets regularly** - Update JWT_SECRET periodically
5. **Use different secrets per environment** - Don't reuse dev secrets in production
6. **Monitor for leaked secrets** - Check commits and logs regularly

## Secrets Management for Production

For production deployments, consider:

1. **Render's Built-in Secrets**: Use Render's environment variable management (encrypted at rest)
2. **Secret Rotation**: Periodically update JWT_SECRET and other secrets
3. **Access Control**: Limit who can view/edit environment variables in Render Dashboard
4. **Audit Logging**: Monitor changes to environment variables

## Troubleshooting

### Application won't start locally

1. Check if `.env` file exists and has all required variables
2. Verify DATABASE_URL format is correct
3. Ensure JWT_SECRET is set and not empty
4. Check console for validation error messages

### Application won't deploy on Render

1. Check Render Dashboard logs for validation errors
2. Verify all environment variables are set in Render Dashboard
3. Ensure DATABASE_URL points to the correct database service
4. Check that JWT_SECRET is generated or manually set

### Tests failing

1. Create a `.env.test` file with test values:
   ```bash
   DATABASE_URL=postgresql://test:test@localhost:5432/test?schema=public
   JWT_SECRET=test-jwt-secret-for-testing-only
   NODE_ENV=test
   ```
2. Run tests with: `NODE_ENV=test npm test`

## Migration from Previous Setup

If you're migrating from the previous setup without environment validation:

1. Hard-coded fallback values have been removed
2. All environment variables must now be explicitly set
3. The application will fail fast with clear error messages if configuration is missing
4. Update your local `.env` file based on `.env.example`
5. Update Render environment variables if needed

## Additional Resources

- [NestJS Configuration Documentation](https://docs.nestjs.com/techniques/configuration)
- [Render Environment Variables Guide](https://render.com/docs/configure-environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Joi Validation Documentation](https://joi.dev/api/)
