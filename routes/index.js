var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');

// use as a parameter to a function that needs authorization
var auth = jwt({
  secret: 'shhhhh',
  userProperty: 'payload'
});

// users.js -> divides functions into individual js files

var ctrlUser = require('./users');
var ctrlPost = require('./posts');

// for users
router.get('/signin', ctrlUser.signIn);
router.get('/user/:userId', ctrlUser.getUser);
router.get('/secretpage', auth, ctrlUser.profileRead);
router.post('/signup', ctrlUser.signUp);

// for posts
// router.get('/post', ctrlPost.signIn); // fix it
router.post('/post/upload', ctrlPost.createPost);
router.get('/post/list', ctrlPost.getPosts);

module.exports = router;
