var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');

// return all users
module.exports.getUsers = function(req, res, next) {
  User.find().sort('name').exec(function(error, result) {
    if(error) return next(error);
    res.json(result);
  });
};

// return an user
module.exports.getUser = function(req, res, next) {
  // write this part as a TIL : req.params.xx
  // front end(Angular.js) sends as User.get({userId.xx});

  User.findById(req.params.userId, function(error, user) {
    if(error) return next(error);
    res.status(200).json(user);
  });
};

module.exports.profileRead = function(req, res, next) {
  // If no user ID exists in the JWT return a 401
  if (!req.payload._id) {
    res.status(401).json({
      "message" : "UnauthorizedError: private profile"
    });
  } else {
    User
      .findById(req.payload._id)
      .exec(function(error, user) {
        if(error) return next(error);
        res.status(200).json(user);
      });
  }
};

module.exports.signIn = function(req, res, next) {
  passport.authenticate('local', function(err, user, info){
    var token;

    // If Passport throws/catches an error
    if (err) {
      res.status(401).json(err);
      return;
    }

    // If a user is found
    // this user that is casted by passport.js
    if(user){
      token = user.generateJwt();
      res.status(200);
      res.json({
        token : token
      });
    } else {
      // If user is not found
      res.status(401).json(info);
    }
  })(req, res);
};

module.exports.signUp = function(req, res, next) {
  var user = new User();
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
};

// module.exports.userModify = function(req, res, next) {
//   // 다음 행을 제거하면 몽구스가 오류를 던진다
//   // 몽고DB ID를 갱신하려 시도하기 때문이다
//   delete req.body._id;
//
//   User.update({
//     id: req.params.userId
//   }, req.body, function(error, numberAffected, response) {
//     if (error || !results) {
//       return next(error);
//     }
//     res.send(response);
//   });
// };
