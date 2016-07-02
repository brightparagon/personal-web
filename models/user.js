var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var Schema = mongoose.Schema;
var UserSchema = new Schema({
  // id: {
  //   type: String,
  //   required: true,
  //   unique: true
  // },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  hash: String,
  salt: String
  // image: {
  //   type: String,
  //   default: 'images/user.png'
  // }
});

UserSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');

  // this.salt와 this.hash가 어떻게 스키마의 프로퍼티를 지칭하는가?
};

UserSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
  return this.hash === hash;
};

UserSchema.methods.generateJwt = function() {
  var expiry = new Date();
  expiry.setDate(expiry.getDate() + 7); // 유효기간은 유저 생성 후 일주일

  return jwt.sign({
    _id: this._id, // ObjectId ?
    email: this.email,
    exp: parseInt(expiry.getTime() / 1000), // exp 프로퍼티는 유효기간(expiry)
  }, 'shhhhh');

  // 'shhhhh'는 임의의 secret key인가?(사용자가 정의?)
  // 서버에서 환경변수로 설정하는 방법은?(코드에 secret key를 넣지 말아야하므로)
};

module.exports = mongoose.model('User', UserSchema, 'users');
