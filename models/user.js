var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserSchema = new Schema({
  // id: {
  //   type: String,
  //   required: true,
  //   unique: true
  // },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
  // image: {
  //   type: String,
  //   default: 'images/user.png'
  // }
}, {collection: 'user'});

module.exports = mongoose.model('User', UserSchema);
