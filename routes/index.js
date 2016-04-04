// exports.article = require('./article');
// exports.user = require('./user');

/*
 * GET home page.
 */

exports.index = function(req, res){
  // req.models.Article.find({published: true}, null, {sort: {_id:-1}}, function(error, articles){
  //   if (error) return next(error);
  //   res.render('index', { articles: articles});
  // });
  res.render('index', {msg: 'Welcome to my first personal web site made of MEAN Stack!'});
};