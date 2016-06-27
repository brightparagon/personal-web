var express = require('express'),
  path = require('path'),
  favicon = require('serve-favicon'),
  logger = require('morgan'), // leaving log message
  // session = require('express-session'),
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
app.use(express.static(path.join(__dirname, 'public'))); // 정적파일 활용
// app.use('/scripts', express.static(path.join(__dirname, 'node_modules')));
// 바로 위 미들웨어 동작하지 않는 것 같다;;

app.use(passport.initialize()); // passport middleware
app.use('/', users); // route 폴더에 index.js가 필요해보인다

// Application Routes
app.use(users);

// Development only
if (app.get('env') === 'development') {
  app.use(errorHandler());
}

app.listen(app.get('port'), function() {
  console.info('Express server listening on port ' + app.get('port'));
});
