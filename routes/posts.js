var mongoose = require('mongoose');
var Post = mongoose.model('Post');

// get the number of all posts
module.exports.getNumOfPosts = function(req, res, next) {
  Post.count(function(error, result) {
    if(error) return next(error);
    res.json({result : result});
  });
};

// find paged posts
module.exports.getPostsPaged = function(req, res, next) {
  var page = req.params.page;
  if(page === null) page = 1;
  var skip = (page - 1) * 5;
  var limit = 5;
  Post.find().populate('postedBy').sort({updated: -1}).skip(skip)
    .limit(limit).exec(function(error, result) {
    if(error) return next(error);
    res.json(result);
  });
};

// find one specific post
module.exports.getPost = function(req, res, next) {
  Post.findById(req.params.postId).populate('postedBy').exec(function(error, post) {
    if(error) return next(error);
    res.status(200).json(post);
  });
};

// create a post
module.exports.createPost = function(req, res, next) {
  var post = new Post(req.body);
  post.save(function(error, post) {
    if(error) return next(error);
    res.status(200).json(post);
  });
};

// update a post
module.exports.updatePost = function(req, res, next) {
  Post.findByIdAndUpdate(req.params.postId, {$set:req.body}, {new:true}, function (error, post) {
    if(error) return next(error);
    res.status(200).json(post);
  });
};

// delete a post
module.exports.deletePost = function(req, res, next) {
  Post.findByIdAndRemove(req.params.postId, function (error, post) {
    if(error) return next(error);
    var response = {
        message: "Post successfully deleted",
        id: post._id
    };
    res.send(response);
  });
};
