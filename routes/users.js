var express = require('express');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var router = express.Router();

router.get('/users', function(req, res, next) {
  User.find().sort('name.last').exec(function(error, results) {
    if(error) {
      return next(error);
    }

    // 유효한 데이터로 응답한다
    res.json(results);
  });
});

router.get('/users/:userId', function(req, res, next) {
  User.findOne({
    id: req.params.userId
  }).exec(function(error, results) {
    if(error) {
      return next(error);
    }

    // 유효한 사용자를 찾지 못하면 404를 전송한다
    if(!results) {
      res.send(404);
    }

    // 유효한 데이터로 응답한다
    res.json(results);
  });
});

router.put('/users/:userId', function(req, res, next) {
  // 다음 행을 제거하면 몽구스가 오류를 던진다
  // 몽고DB ID를 갱신하려 시도하기 때문이다
  delete req.body._id;

  User.update({
    id: req.params.userId
  }, req.body, function(error, numberAffected, response) {
    if (error) {
      return next(error);
    }

    res.send(200);
  });
});

router.post('/users/', function (req, res, next) {
  User.create(req.params.user, function(error, results) {
    if(error) {
      return next(error);
    }

    res.json(results);
  })
});

module.exports = router;
