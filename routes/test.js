/*
 * GET login page.
 */

exports.login = function(req, res, next) {
  res.render('login');
};

/*
 * GET logout route.
 */

exports.logout = function(req, res, next) {
  // req.session.destroy();
  res.redirect('/'); //root -> index.jade
};