# Vantillu Production Checklist

Before launching to live customers, verify the following:

- [ ] **Email Verified Setup**: Ensure Brevo credentials are valid in production and sender email is verified.
- [ ] **Idempotency Setup**: Verify that identical order submissions within a short timeframe do not generate duplicate database rows.
- [ ] **Optimistic Locking Test**: Test two admin users editing the same menu item. The second user should receive a "Refresh required" error.
- [ ] **Build Command**: Update Render settings to run `bash scripts/migrate.sh` before `gunicorn app:app`.
- [ ] **Connection Pooling**: Ensure `DATABASE_URL` uses the pooler connection string (Port 6543 or Supabase specific pooler) and not the direct IPv6 string.
- [ ] **GPS Coordinates**: In `CartDrawer.tsx`, ensure the `RESTAURANT_LAT` and `RESTAURANT_LNG` variables are updated to the exact coordinates of Vantillu Restaurant.
