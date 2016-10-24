var mongoose = require('mongoose');
var Post = mongoose.model('Post');

// find all posts
module.exports.getPosts = function(req, res, next) {
  console.log('server getPosts');

  var monthNames = [
      'January', 'February', 'March',
      'April', 'May', 'June', 'July',
      'August', 'September', 'October',
      'November', 'December'
   ];
  Post.find().sort('updated').exec(function(error, result) {
    if(error) return next(error);
    for(var i = 0; i<result.length; i++) {
      result[i].date = '';
      result[i].date = result[i].updated.getDate() + ' ' + monthNames[result[i].updated.getMonth() + 1] +
        ' ' + result[i].updated.getFullYear();
    }
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

  // Post.findByIdAndUpdate(req.params.postId, { $set: { size: 'large' }}, { new: true }, function (err, post) {
  //   if(error) return next(error);
  //   res.status(200).json(post);
  // });
};

// delete a post
module.exports.deletePost = function(req, res, next) {
  console.log('server deletePost');

  Post.remove({_id:req.params.postId}, function(error) {
    if(error) return next(error);
    res.status(200);
  });
};
