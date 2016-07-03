var express = require('express'),
  path = require('path'),
  favicon = require('serve-favicon'),
  logger = require('morgan'), // leave log message
  errorHandler = require('errorhandler'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'), // simulate delete & post method(?)
  passport = require('passport'); // passport authentication

require('./lib/connection'); // Mongodb connection
var users = require('./routes/users'); // routes for users

require('./config/passport');

var app = express();
app.locals.appTitle = "personal-web";

// All environments
app.set('port', process.env.PORT || 3000);
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade'); // jade -> later

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(session({secret: 'individual'}));
app.use(methodOverride());
// app.use(require('stylus').middleware(path.join(__dirname, 'public')));
// app.use(require('angular').middleware(__dirname + 'node_modules'));
// 이 위에 미들웨어는 체크 해봐야 함
app.use(express.static(path.join(__dirname, 'public'))); // use static files
// app.use('/scripts', express.static(path.jsoin(__dirname, 'node_modules')));
// it above doesn't work

app.use(passport.initialize()); // passport middleware

// route 부분 통일해서 수정해야함
app.use('/api', users); // route 폴더에 index.js가 필요해보인다
// Application Routes
app.use(users);

app.use(function (error, req, res, next) {
  if (error.name === 'UnauthorizedError') {
    res.status(401);
    res.json({"message" : error.name + ": " + error.message});
  }
});

// Development only
if (app.get('env') === 'development') {
  app.use(errorHandler());
}

app.listen(app.get('port'), function() {
  console.info('Express server listening on port ' + app.get('port'));
});
