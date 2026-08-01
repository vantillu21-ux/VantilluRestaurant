# Vantillu Deployment Guide

## Production Topology
- **Frontend**: Vercel (Auto-deploys from `main` branch).
- **Backend**: Render Web Service (Auto-deploys from `main` branch).
- **Database**: Supabase PostgreSQL.

## Environment Variables
Ensure these are set in Render and Vercel:
- `DATABASE_URL`: The Supabase Connection Pooler URL (Transaction Mode).
- `JWT_SECRET`: Secret for Admin Auth.
- `BREVO_API_KEY`: Brevo API key for Email OTP.
- `CLIENT_URL`: `https://vantillu-restaurant.vercel.app`

## Database Migrations
Migrations are handled via Flask-Migrate (Alembic).
During deployment on Render, the Build Command should run:
```bash
./scripts/migrate.sh
```
This safely applies `flask db upgrade`. **Never** run `flask db upgrade` inside the `app.py` startup routine to avoid concurrent race conditions during rolling restarts.

## Logging
Logs are printed to stdout and automatically collected by Render.
