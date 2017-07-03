function checkAuth(res, req, next) {
  if (!req.session.user) {
    res.redirect("/");
  } else {
    next();
  }
}

module.exports = checkAuth;
