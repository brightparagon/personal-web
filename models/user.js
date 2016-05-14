var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    first: {
      type: String,
      required: true
    },
    last: {
      type: String,
      required: true
    }
  },
  email: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: 'images/user.png'
  }
});

module.exports = mongoose.model('User', UserSchema);
