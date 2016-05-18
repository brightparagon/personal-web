var express = require('express'),
  path = require('path'),
  favicon = require('serve-favicon'),
  models = require('./models');

require('./lib/connection'); // Mongodb connection
var users = require('./routes/users'); // routes for users

var session = require('express-session'), // find more info about it
  logger = require('morgan'), // leaving log message
  errorHandler = require('errorhandler'),
  cookieParser = require('cookie-parser'), // roles of cookie-parser & body-parser?
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'); // simulate delete & post method(?)

var app = express();
app.locals.appTitle = "personal-web";

// Mongoose models check
app.use(function(req, res, next) {
  if (!models.User) return next(new Error("No models."))
  // req.models = models;
  return next();
});

// All environments
app.set('port', process.env.PORT || 3000);
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade'); //jade는 나중에 쓰도록 하자(프로젝트를 많이 이해한 뒤에)

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('3CCC4ACD-6ED1-4844-9217-82131BDCB239'));
app.use(session({secret: '2C44774A-D649-4D44-9535-46E296EF984F'}));
app.use(methodOverride());
// app.use(require('stylus').middleware(path.join(__dirname, 'public')));
// app.use(require('angular').middleware(__dirname + 'node_modules'));
// 이 위에 미들웨어는 체크 해봐야 함
app.use(express.static(path.join(__dirname, 'public'))); // 정적파일 활용
// app.use('/scripts', express.static(path.join(__dirname, 'node_modules')));
// 바로 위 미들웨어 동작하지 않는 것 같다;;

// Application Routes
app.use(users);

// Development only
if (app.get('env') === 'development') {
  app.use(errorHandler());
}

app.listen(app.get('port'), function() {
  console.info('Express server listening on port ' + app.get('port'));
});
