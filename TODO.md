# TODO

- [x] Inspect register/login UI and API route wiring
- [x] Fix 500 on `POST /api/users/register` by hardening validation and logging (`routes/userRoutes.js`)
- [x] Unify session shape between `server.js` auth handlers and `routes/userRoutes.js`
- [ ] Re-test on Render: `POST /api/users/register` from `views/register.ejs`
- [ ] Verify role-based navigation:
  - [ ] User -> `/dashboard`
  - [ ] Admin -> `/admin`
- [ ] Verify admin-only API endpoints still block non-admin users (`bookingRoutes` approve/reject)

