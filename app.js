var express = require('express'),
  path = require('path'),
  favicon = require('serve-favicon');

require('./lib/connection'); //Mongodb 연결
var users = require('./routes/users'); //routes for users

var session = require('express-session'), //express-session은 세션 관련 모듈 --> 더 찾아볼 것
  logger = require('morgan'), //morgan은 log를 남기는 기능을 제공하는 모듈
  errorHandler = require('errorhandler'),
  cookieParser = require('cookie-parser'), // cookie-parser와 body-parser의 역할?
  bodyParser = require('body-parser');
  // methodOverride = require('method-override'); // 오버라이드에 필요한 모듈인가? 자바스크립트엔 오버라이드 개념이 없어서 모듈을 이용?

var app = express();
app.locals.appTitle = "personal-web";

// app.use(function(req, res, next) { //몽고디비 유효성 검사
//   if(!models.User) return next(new Error("No models."));
//   req.models = models;
//   return next();
// });

// All environments
app.set('port', process.env.PORT || 3000);
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade'); //jade는 나중에 쓰도록 하자(프로젝트를 많이 이해한 뒤에)

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('3CCC4ACD-6ED1-4844-9217-82131BDCB239'));
app.use(session({secret: '2C44774A-D649-4D44-9535-46E296EF984F'}));
// app.use(methodOverride());
// app.use(require('stylus').middleware(path.join(__dirname, 'public')));
// app.use(require('angular').middleware(__dirname + 'node_modules'));
//이 위에 미들웨어는 체크 해봐야 함
app.use(express.static(path.join(__dirname, 'public'))); //정적파일 활용
// app.use('/scripts', express.static(path.join(__dirname, 'node_modules')));
//바로 위 미들웨어 동작하지 않는 것 같다;;

// Application Routes
app.use(users);

// Development only
if (app.get('env') === 'development') {
  app.use(errorHandler());
}

//앞으로 해야할 것(이 파일에서)
//앵귤러에서 온 요청 처리할 라우트 설정
//./routes 폴더에 각 라우트.js 만들기
//각 라우트.js 에서 몽고디비로 데이터 가져온 후 다시 앵귤러로 보내기

app.listen(app.get('port'), function() {
  console.info('Express server listening on port ' + app.get('port'));
});
