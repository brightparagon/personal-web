exports.test = require('./test'); //app.get('/', routes.index); 에서 / index.js로 고정하고
								  //app.post('/login', routes.user.authenticate); 이런 경우엔
								  // index.js에서 user.js를 export.user = requre(./user);를 써서 익스포트를 해줘야
								  //routes.user.authenticate가 잡힌다

/*
 * GET home page.
 */

exports.index = function(req, res){
  // req.models.Article.find({published: true}, null, {sort: {_id:-1}}, function(error, articles){
  //   if (error) return next(error);
  //   res.render('index', { articles: articles});
  // });
  res.render('index.html');
};
