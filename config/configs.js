'use strict';

var configs = angular.module('configs', []);

configs.constant('AUTH_EVENTS', {
  	loginSuccess: 'auth-login-success',
  	loginFailed: 'auth-login-failed',
});
