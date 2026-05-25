# How to become an Admin (no Postman)

## 1) Create/seed an admin user
Run the seed script with these environment variables:

### Local (example)
```bash
ADMIN_FULLNAME="Admin" \
ADMIN_EMAIL="admin@gmail.com" \
ADMIN_PASSWORD="change_me" \
node database/createAdmin.js
```

This will create the user (or update it) with `role = 'admin'`.

## 2) Login as admin
- Open the app in the browser
- Go to **Login**
- Use the `ADMIN_EMAIL` and `ADMIN_PASSWORD`

Admin will be redirected to **/admin** automatically.

## Notes
- `database/createAdmin.js` no longer contains hard-coded credentials.
- For the UPSERT to work safely, your `users.email` column should be `UNIQUE`.

