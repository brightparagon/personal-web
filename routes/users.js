var express = require('express');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var router = express.Router();

// 모든 유저 반환 라우팅
router.get('/users/users', function(req, res, next) {
  User.find().sort('name.last').exec(function(error, results) {
    if(error) {
      return next(error);
    }
    res.json(results);
  });
});

// 특정 유저 반환 라우팅
router.get('/users/:userId', function(req, res, next) {
  // url 경로에서 :userId 의 이름은 정하기 나름
  User.findOne({
    id: req.params.userId
  }).exec(function(error, results) {
    if(error) {
      return next(error);
    }
    // 유효한 사용자를 찾지 못하면 404를 전송한다
    // if(!results) {
    //   res.send(404);
    // }

    // 유효한 데이터로 응답한다
    res.json(results);
  });
});

// 유저 추가 라우팅
router.post('/users', function (req, res, next) {
  var user = new User(req.body.user);
  user.save(function(error, results) {
    if(error || !results) {
      return next(error);
    }
    res.json(results);
  })
});

// 특정 유저 업데이트 라우팅
router.put('/users/:userId', function(req, res, next) {
  // 다음 행을 제거하면 몽구스가 오류를 던진다
  // 몽고DB ID를 갱신하려 시도하기 때문이다
  delete req.body._id; //이 행의 역할 정확히 조사하기

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
