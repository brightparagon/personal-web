var express = require('express');
var mongoose = require('mongoose');
var crypto = require('crypto');
var passport = require('passport');
var jwt = require('express-jwt');
var User = mongoose.model('User');
var router = express.Router();

// used as a parameter to a function that needs authorization
var auth = jwt({
  secret: 'shhhhh',
  userProperty: 'payload' // need to find how key & value is set and used
});

// returning all the users
router.get('/api/users/users', function(req, res, next) {
  User.find().sort('name.last').exec(function(error, results) {
    if(error) return next(error);
    res.json(results);
  });
});

// secret page
router.get('/api/users/secretpage', auth, function(req, res, next) {
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
router.get('/api/users', function(req, res, next) {
  // url 경로에서 :userId 의 이름은 정하기 나름
  // /users/:userId 에서 userId는 ObjectId인가? 아니면 사용자 정의 property인가?

  // User.findOne({
  //   email: req.body.email // find a user by email address(unique as now)
  // }, function(error, user) {
  //   if(error) return next(error);
  //   res.json(user);
  // });

  passport.authenticate('local', function(error, user, info){ // this user passed by passport
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

  // how this passport.authenticate() work? -> see api doc of passport module
});

// sign up
router.post('/api/users', function (req, res, next) {

  // var user = new User({ // previous way
  //   email: req.body.email,
  //   password: encryptPassword(req.body.password)
  // });

  var user = new User(); // new way
  user.name = req.body.name;
  user.email = req.body.email;
  user.setPassword(req.body.password);

  user.save(function(error, user) {
    if(error) return next(error);
    var token;
    token = user.generateJwt();
    res.status(200);
    res.json({
      "token" : token
    });
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
