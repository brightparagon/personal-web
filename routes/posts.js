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

  Post.findById(req.params.postId, function(error, post) {
    if(error) return next(error);
    res.status(200).json(post);
  });
};

// create a post
module.exports.createPost = function(req, res, next) {
  console.log('server createPost');

  var post = new Post(req.body);
  // if it doesn't work do below
  // post.title = req.body.title;

  post.save(function(error, post) {
    if(error) return next(error);
    res.status(200).json(post);
  });
};

// update a post
module.exports.updatePost = function(req, res, next) {
  console.log('server updatePost');

  Post.findByIdAndUpdate(req.params.postId, {$set:req.body}, {new:true}, function (error, post) {
    if(error) return next(error);
    res.status(200).json(post);
  });
};

// delete a post
module.exports.deletePost = function(req, res, next) {
  console.log('server deletePost');

  // Post.remove({_id:req.params.postId}, function(error) {
  //   if(error) return next(error);
  //   res.status(200);
  // });

  Post.findByIdAndRemove(req.params.postId, function (error, post) {
    if(error) return next(error);
    var response = {
        message: "Todo successfully deleted",
        id: post._id
    };
    res.send(response);
  });
};
