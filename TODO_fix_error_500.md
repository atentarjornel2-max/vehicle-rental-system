# TODO - Fix Internal Server Error (500)

## 1) Confirm runtime error source
- Add centralized Express error handler middleware in `server.js` to log stack traces to stdout and return safe message.

## 2) Fix likely bug causing crash
- In `routes/bookingRoutes.js`, ensure transaction logic uses correct query API and does not double-reference booking row.
- Also ensure `req.session.user.role` is available for admin routes; add guards for missing role.

## 3) Fix route/session mismatch
- Unify session shape between `server.js` and `routes/userRoutes.js` (currently one stores full user row, other stores subset). This can cause `req.session.user.role` to be undefined.

## 4) Fix API/public double mounting conflicts (if any)
- Verify register/login flow uses only one set of routes (either `server.js` handlers or `routes/userRoutes.js`) and does not conflict.

## 5) Deploy test
- Run locally and reproduce failing request.
- After stack trace shows exact cause, patch accordingly.

