var express = require('express'),
  routes = require('./routes'),
  http = require('http'),
  path = require('path');
  // mongoose = require('mongoose'),
  // models = require('./models');
  // dbUrl = process.env.MONGOHQ_URL || 'mongodb://@localhost:27017/blog',  --> 27017/blog 에서 blog는 디비 이름?
  // db = mongoose.connect(dbUrl, {safe: true});

// var session = require('express-session'), //express-session은 세션 관련 모듈 --> 더 찾아볼 것
//   logger = require('morgan'), //morgan은 log를 남기는 기능을 제공하는 모듈
//   errorHandler = require('errorhandler'),
//   cookieParser = require('cookie-parser'), // cookie-parser와 body-parser의 역할?
//   bodyParser = require('body-parser'),
//   methodOverride = require('method-override'); // 오버라이드에 필요한 모듈인가? 자바스크립트엔 오버라이드 개념이 없어서 모듈을 이용?

var app = express();
app.locals.appTitle = "personal-web";

// app.use(function(req, res, next) {
//   if (!models.Article || ! models.User) return next(new Error("No models."))
//   req.models = models;
//   return next();
// });

// All environments
app.set('port', process.env.PORT || 8000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(cookieParser('3CCC4ACD-6ED1-4844-9217-82131BDCB239'));
// app.use(session({secret: '2C44774A-D649-4D44-9535-46E296EF984F'}));
// app.use(bodyParser.urlencoded());
// app.use(methodOverride());
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public'))); //정적파일 활용

// Development only
// if ('development' === app.get('env')) {
//   app.use(errorHandler());
// }

// Pages and routes
app.get('/', routes.index);
app.get('/login', routes.test.login);
// app.get('/admin', authorize, routes.article.admin);
// app.get('/post', authorize, routes.article.post);
// app.post('/post', authorize, routes.article.postArticle);
// app.get('/articles/:slug', routes.article.show);

// REST API routes
// app.all('/api', authorize);
// app.get('/api/articles', routes.article.list);
// app.post('/api/articles', routes.article.add);
// app.put('/api/articles/:id', routes.article.edit);
// app.del('/api/articles/:id', routes.article.del);

app.all('*', function(req, res) {
  res.send(404);
})

// http.createServer(app).listen(app.get('port'), function(){
  // console.log('Express server listening on port ' + app.get('port'));
// });

var server = http.createServer(app);
var boot = function () {
  server.listen(app.get('port'), function(){
    console.info('Express server listening on port ' + app.get('port'));
  });
}
var shutdown = function() {
  server.close();
}
if (require.main === module) {
  boot();
} else {
  console.info('Running app as a module')
  exports.boot = boot;
  exports.shutdown = shutdown;
  exports.port = app.get('port');
}