'use strict';
var configs = angular.module('blog.configs', ['ngRoute', 'ngMaterial', 'ngMdIcons']);

// custom constant
// not use yet
configs.constant('AUTH_EVENTS', {
  	loginSuccess: 'auth-login-success',
  	loginFailed: 'auth-login-failed'
});

// angular route
configs.config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'home.html',
			controller: 'homeCtrl',
			controllerAs: 'vm',
		})
    // .when('/posts/view/:postId', {
		// 	templateUrl: 'viewPost.html',
    //   resolve: {
    //     post: ['PostLoader', function(PostLoader) {
    //       return PostLoader();
    //     }]
    //   },
		// 	controller: 'viewPostCtrl',
		// 	controllerAs: 'vm'
		// })
    .when('/posts/edit/:postId', {
			templateUrl: 'editPost.html',
      resolve: {
        post: ["PostLoader", function(PostLoader) {
          return PostLoader();
        }]
      },
			controller: 'editPostCtrl',
			controllerAs: 'vm'
		})
    .when('/posts/list', {
			templateUrl: 'listPost.html',
      resolve: {
        posts: ['PostsLoader', function(PostsLoader) {
          return PostsLoader();
        }]
      },
			controller: 'listPostCtrl',
			controllerAs: 'vm'
		})
    .when('/posts/upload', {
			templateUrl: 'uploadPost.html',
			controller: 'uploadPostCtrl',
			controllerAs: 'vm'
		})
		.when('/signup', {
			templateUrl: 'signup.html',
			controller: 'signUpCtrl',
			controllerAs: 'vm'
		})
		.when('/signin', {
			templateUrl: 'signin.html',
			controller: 'signInCtrl',
			controllerAs: 'vm'
		})
		.when('/secretpage', {
			templateUrl: 'secretpage.html',
			controller: 'secretCtrl',
			controllerAs: 'vm'
		})
    .when('/about', {
			templateUrl: 'about.html',
			controller: 'aboutCtrl',
			controllerAs: 'vm'
		})
		.otherwise({
			redirectTo: '/'
		});
}]);

// angular material theme
configs.config(function($mdThemingProvider) {
  var customBlueMap = $mdThemingProvider.extendPalette('light-blue', {
    'contrastDefaultColor': 'light',
    'contrastDarkColors': ['50'],
    '50': 'ffffff'
  });
  $mdThemingProvider.definePalette('customBlue', customBlueMap);
  $mdThemingProvider.theme('default')
    .primaryPalette('customBlue', {
      'default': '500',
      'hue-1': '50'
    })
    .accentPalette('pink');
});
