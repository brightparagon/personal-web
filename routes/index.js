var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');

// used as a parameter to a function that needs authorization
var auth = jwt({
  secret: 'shhhhh',
  userProperty: 'payload'
});

// users.js -> divides functions into individual js files

var ctrlUser = require('./users');

router.post('/signup', ctrlUser.signUp);
router.get('/signin', ctrlUser.signIn);
router.get('/secretpage', auth, ctrlUser.profileRead);

module.exports = router;
