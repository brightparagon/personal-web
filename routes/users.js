var express = require('express');
var mongoose = require('mongoose');
var crypto = require('crypto');
var passport = require('passport');
var jwt = require('express-jwt');
var User = mongoose.model('User');
var router = express.Router();

// 이 함수를 특정 유저만이 접근해야 하는 라우터에서 사용하면 된다
var auth = jwt({
  secret: 'shhhhh',
  userProperty: 'payload' //키, 밸류 이름이 어떻게 정해지고 사용되는지 알아야함
});

// returning all the users
router.get('/api/users/users', function(req, res, next) {
  User.find().sort('name.last').exec(function(error, results) {
    if(error) return next(error);
    res.json(results);
  });
});

// secret page
router.get('/api/users/:email', function(req, res, next) { // url 경로 수정
  if (!req.payload._id) {
    res.status(401).json({
      "message" : "UnauthorizedError: private profile"
    });
  } else {
    User
      .findById(req.payload._id) // _id --> ObjectId?
      .exec(function(error, user) {
        if(error) return next(error);
        res.status(200).json(user);
      });
  }
});

// login
router.get('/api/users/:email', function(req, res, next) {
  // url 경로에서 :userId 의 이름은 정하기 나름
  // /users/:userId 에서 userId는 ObjectId인가? 아니면 사용자 정의 property인가?

  // User.findOne({
  //   email: req.body.email // 우선은 email(현재로선 unique)로 단일 row 검색
  // }, function(error, user) {
  //   if(error) return next(error);
  //   res.json(user);
  // });

  // user를 어떻게 넘겨줄 것인가?
  // passport 작동 방식 how?
  passport.authenticate('local', function(error, user, info){
    var token;

    // If Passport throws/catches an error
    if (error) {
      res.status(404).json(error);
      return;
    }

    // If a user is found
    if(user){
      token = user.generateJwt();
      res.status(200);
      res.json({
        "token" : token
      });
    } else {
      // If user is not found
      res.status(401).json(info);
    }
  })(req, res);
});

// sign up
router.post('/api/users', function (req, res, next) {

  // var user = new User({ // 기존 방식
  //   email: req.body.email,
  //   password: encryptPassword(req.body.password)
  // });
  var user = new User(); // 새로운 방식
  user.email = req.body.email;
  user.setPassword(req.body.password);

  user.save(function(error, user) { // 저장 후 user를 callback으로 다시 받아야할 필요가 있는가?
    if(error) return next(error);
    var token;
    token = user.generateJwt();
    res.status(200);
    res.json({
      "token" : token
    });
    // res.json(user);
  });
});

// update
router.put('/api/users/:userId', function(req, res, next) {
  // 다음 행을 제거하면 몽구스가 오류를 던진다
  // 몽고DB ID를 갱신하려 시도하기 때문이다
  delete req.body._id;

  User.update({
    id: req.params.userId
  }, req.body, function(error, numberAffected, response) {
    if (error || !results) {
      return next(error);
    }
    res.send(response);
  });
});

module.exports = router;
