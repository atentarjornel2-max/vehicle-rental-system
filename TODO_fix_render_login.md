# Render login/DB error fix checklist

- [ ] Update `server.js` login error handling to log the real DB error details. ✅
- [ ] Unify auth routing:
  - [ ] Keep `POST /login` and `POST /register` in `server.js` (or single place)
  - [ ] Remove conflicting `POST /login` (and any conflicting register) from `routes/userRoutes.js`.
- [ ] Fix API register so `POST /api/users/register` works:
  - [ ] Ensure `routes/userRoutes.js` exports a `/register` route that accepts the expected body fields.
  - [ ] Ensure correct validation and DB insert values match schema (`users` table).
- [ ] Add basic env var validation in `config/db.js` to avoid silent undefined connection fields. ✅ (already exists)
- [ ] Test locally (if possible) and then retest on Render:
  - [ ] `POST /api/users/register`
  - [ ] Browser `/login`

