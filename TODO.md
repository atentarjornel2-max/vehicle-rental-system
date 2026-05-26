# TODO

## Login / Render 500 fixes
- [ ] Confirm runtime error source for `POST /login` by verifying DB query + session behavior
- [ ] Ensure tables exist + admin seeding works on Render (`database/seedOnStartup.js`)
- [ ] Unify session shape between login (`req.session.user = { id, fullname, email, role }`) and any other routes that set session
- [ ] Remove/avoid conflicting auth routes if any (currently login is in `server.js`)
- [ ] Add smoke-test checklist (register -> login -> dashboard; login as admin -> /admin)

## Misc (possible follow-ups)
- [ ] Verify booking routes for any SQL/transaction bugs (separate from login)

