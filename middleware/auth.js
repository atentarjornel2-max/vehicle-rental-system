function requireLogin(req, res, next) {
  if (req.session?.user?.id) return next();
  return res.redirect("/login");
}

function requireAdmin(req, res, next) {
  if (req.session?.user?.role === "admin") return next();
  return res.status(403).send("No access");
}

module.exports = {
  requireLogin,
  requireAdmin
};

