var mongoose = require('mongoose');
var Post = mongoose.model('Post');

// find all posts
module.exports.getPosts = function(req, res, next) {
  console.log('server getPosts');

  Post.find().sort('updated').exec(function(error, result) {
    if(error) return next(error);
    res.json(result);
  });
};

// find one specific post
module.exports.getPost = function(req, res, next) {
  console.log('server getPost');
  Post
    .findById(req.body._id)
    .exec(function(error, post) {
      if(error) return next(error);
      res.status(200).json(post);
    });
};

// create a post
module.exports.createPost = function(req, res, next) {
  console.log('server createPost');

  var post = new Post(req.body); // if it doesn't work do below
  // post.title = req.body.title;

  post.save(function(error, post) {
    if(error) return next(error);
    res.status(200);
    res.json(post);
  });
};
