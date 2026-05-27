# TODO - Vehicle Rental System (Render)

## Auth + Dashboards (required)
- [ ] Fix missing HTML routes in `server.js` so `/login`, `/register`, `/dashboard`, `/vehicles`, `/my-bookings`, `/admin`, `/admin/vehicles`, `/admin/bookings` render the existing EJS templates.
- [ ] Align login form action in `views/login.ejs` to `POST /api/users/login` (currently posts to `/login`).
- [ ] Ensure `/logout` destroys session and redirects.
- [ ] Implement user dashboard queries for `pending` and `approved` variables used in `views/dashboard.ejs`.
- [ ] Implement admin dashboard queries for `pendingBookings` and `vehicles` used in `views/admin.ejs`.
- [ ] Implement `/admin/vehicles` + `/admin/bookings` queries used by admin EJS pages.
- [ ] Verify route guards: user dashboard requires `requireLogin`; admin pages require `requireAdmin`.


## Testing
- [ ] Deploy/retest on Render: login -> redirect `/dashboard` for user; admin account -> `/admin` access.
- [ ] Try create account -> login -> booking flow -> my bookings view.

