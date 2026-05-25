# Render login fix / startup seeding

## Goal
Ensure at least an admin user exists on Render so `/login` does not show `User not found`.

## Steps
1. Add startup seeding hook in `server.js` that runs:
   - creates tables if missing
   - ensures admin user exists when `ADMIN_EMAIL/ADMIN_PASSWORD/ADMIN_FULLNAME` are present
2. Keep existing DB init logic untouched where possible.
3. Log seeding results to Render logs (without printing passwords).
4. Restart Render service.
5. Test:
   - POST/Browser `/login` with seeded admin email
   - `/admin` access

