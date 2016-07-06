var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');

// used as a parameter to a function that needs authorization
var auth = jwt({
  secret: 'shhhhh',
  userProperty: 'payload'
});

// Fix after this
// users.js -> divides functions into individual js files

var ctrlUser = require('./users');

// profile
router.get('/profile', auth, ctrlProfile.profileRead);

// authentication
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

module.exports = router;
