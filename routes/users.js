var express = require('express');
var mongoose = require('mongoose');
var crypto = require('crypto');
var User = mongoose.model('User');
var router = express.Router();
var key = 'myKey';

function encryptPassword(password) {
  var cipher = crypto.createCipher('aes192', key);
  cipher.update(password, 'utf8', 'base64');
  var encryptedPassword = cipher.final('base64');
  return encryptedPassword;
}

function decryptPassword(password) {
  return crypto.createDecipher('aes192', key)
                .update(password, 'base64', 'utf8')
                .final('utf8');
}

// routing for returning all the users
router.get('/users/users', function(req, res, next) {
  User.find().sort('name.last').exec(function(error, results) {
    if(error) {
      return next(error);
    }
    res.json(results);
  });
});

// routing for returning a certain user
// login
router.get('/users', function(req, res, next) {
  // url 경로에서 :userId 의 이름은 정하기 나름
  // /users의 users가 곧 mongodb의 collection이 되는 것인가
  // /users/:userId 에서 넘어오는 userId는 어디서 오는 것인가?

  User.findOne({
    email: req.body.email,
    password: decryptPassword(req.body.password)
  }).exec(function(error, user) {
    if(error) return next(error);
    // if(!user) return //user 못찾았을 때 무엇을 반환해서 처리할까
    req.session.user = user;
  });
});

// routing for adding an user
router.post('/users', function (req, res, next) {
  var user = {
    email: req.body.email,
    password: encryptPassword(req.body.password)
  };
  User.create(user, function(error, user) {
    if(error) return next(error);
    res.json(user);
  });
});

// routing for updating an user
router.put('/users/:userId', function(req, res, next) {
  // 다음 행을 제거하면 몽구스가 오류를 던진다
  // 몽고DB ID를 갱신하려 시도하기 때문이다
  delete req.body._id; // what is this for?

  User.update({
    id: req.params.userId
  }, req.body, function(error, numberAffected, response) {
    if (error || !results) {
      return next(error);
    }
    res.send(200);
    // res.send(response); //200 ? why not send response?
  });
});

module.exports = router;
