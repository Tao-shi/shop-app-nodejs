exports.getErrorPage = (req, res) => {
  // Chaining response methods, send has to be the last
  // res.status(404).sendFile(path.join(rootDir, 'views', 'page-error.html'))
  res.status(404).render("page-error", {
    pageTitle: "Page not found",
    path: "404",
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.getError505page = (req, res) => {
  // Chaining response methods, send has to be the last
  // res.status(404).sendFile(path.join(rootDir, 'views', 'page-error.html'))
  res.status(500).render("error-500", {
    pageTitle: "Error!",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
};
