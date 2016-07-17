var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan'); // leave log message
var errorHandler = require('errorhandler');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override'); // simulate delete & post method(?)
var passport = require('passport'); // passport authentication

require('./lib/connection'); // MongoDB connection
require('./config/passport');

// bring in the routes for the API
var routesApi = require('./routes/index');

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
// it doesn't work

// passport middleware
app.use(passport.initialize());

// route
app.use('/api', routesApi);

// error handler for the unauthorized access
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401);
    res.json({"message" : err.name + ": " + err.message});
  }
});

// development error handler
// print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.listen(app.get('port'), function() {
  console.info('Express server listening on port ' + app.get('port'));
});
