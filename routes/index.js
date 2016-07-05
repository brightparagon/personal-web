var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
  secret: 'shhhhh',
  userProperty: 'payload' // need to find how key & value is set and used
});

// Fix after this
// users.js -> divides functions into individual js files

var ctrlProfile = require('../controllers/profile');
var ctrlAuth = require('../controllers/authentication');

// server-side controller(routing)

// profile
router.get('/profile', auth, ctrlProfile.profileRead);

// authentication
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

module.exports = router;
