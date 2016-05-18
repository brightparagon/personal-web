var express = require('express');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var router = express.Router();

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
router.get('/users/:userId', function(req, res, next) {
  // url 경로에서 :userId 의 이름은 정하기 나름
  User.findOne({
    id: req.params.userId
  }).exec(function(error, results) {
    if(error) {
      return next(error);
    }
    // if(!results) {
    //   res.send(404);
    // }

    res.json(results);
  });
});

// routing for adding an user
router.post('/users', function (req, res, next) {
  User.create(req.body, function(error, results) {
    if(error) return next(error);
    res.json(results);
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
