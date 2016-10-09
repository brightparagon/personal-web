var express = require('express');
var path = require('path');
// var favicon = require('serve-favicon');
var logger = require('morgan'); // leave log message
var errorHandler = require('errorhandler');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override'); // simulate delete & post method(?)
var passport = require('passport'); // passport authentication

require('./mongodb/connection'); // MongoDB connection
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
app.use(express.static(path.join(__dirname, 'public'))); // use static files

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
  app.use(function(error, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: error.message,
      error: error
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(error, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: error.message,
    error: {}
  });
});

app.listen(app.get('port'), function() {
  console.info('Express server listening on port ' + app.get('port'));
});
