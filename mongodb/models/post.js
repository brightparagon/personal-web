var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var postSchema = new Schema({
  postedBy: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: true
  },
  isPrivate: {
    type: Boolean,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  // notekind: {
  //   type: String,
  //   required: true
  // },
  updated: {
    type: Date,
    default: Date.now
  },
  tags: [String]
});

module.exports = mongoose.model('Post', postSchema);
