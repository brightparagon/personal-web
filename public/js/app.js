'use strict';

// divide this file into several files on the basis of roles like controller, configuration, directive..

var app = angular.module('blogapp', ['ngResource', 'ngMessages', 'blog.configs']);

app.run(['$rootScope', '$location', 'authentication',
	function($rootScope, $location, authentication) {
	$rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute) {
		console.log('routeChangeStart called');
		// every move or change to any pages will be calling this $on(it is made to do that)
		// even the first access to this web will call this method

	  if($location.path() === '/secretpage' && !authentication.isLoggedIn()) {
	  	$location.path('/');
    }
  });
}]);

// app.directive('navigation', function navigation() {
// 	return {
// 		restrict: 'EA',
// 		templateUrl: 'navigation.html',
// 		controller: 'navigationCtrl',
// 		controllerAs: 'navvm'
// 	};
// });

// if I take this service module to the other js file and inject it to this app.js
// angular.js throws an injection error.
// refer to other mean projects!
app.service('authentication', ['$window', function($window) {
	var saveToken = function(token) {
		$window.localStorage['user-token'] = token;
	};

	var getToken = function() {
		return $window.localStorage['user-token'];
	};

	var signOut = function() {
		$window.localStorage.removeItem('user-token');
	};

	var isLoggedIn = function() {
		var token = getToken();
		var payload;

		console.log('authentication called');
		if(token) {
			console.log('token : ' + token);

			payload = token.split('.')[1];
			payload = $window.atob(payload);
			payload = JSON.parse(payload);

			return payload.exp > Date.now() / 1000;
		} else {
			return false;
		}
	};

	var currentUser = function() {
		if(isLoggedIn()){
			console.log('currentUser called');

			var token = getToken();
			var payload = token.split('.')[1];
			payload = $window.atob(payload);
			payload = JSON.parse(payload);

			return payload;
		}
	};

	return {
    currentUser : currentUser,
		signOut : signOut,
    saveToken : saveToken,
    getToken : getToken,
    isLoggedIn : isLoggedIn
  };
}]);

// understand how $http.get part is authorized
// & how this works with auth
app.service('getData', ['$http', 'authentication', function($http, authentication) {
	var getProfile = function() {
		return $http.get('/api/secretpage', {
		  headers: {
		    Authorization: 'Bearer '+ authentication.getToken()
		  }
		});
	};

  return {
    getProfile : getProfile
  };
}]);

// modify it
// app.factory('userService', ['$resource', function($resource) {
//   return $resource('/api', {}, { // url part maybe needs fixing
// 		save: {
// 			method: 'POST'
// 		},
//     update: {
//       method: 'PUT'
//     },
// 		get: {
// 			method: 'GET'
// 		}
//   });
// }]);

app.controller('homeCtrl', ['$scope', '$location', 'authentication', function($scope, $location, authentication) {

}]);

app.controller('navCtrl', ['$scope', '$rootScope', '$location', 'authentication', function($scope, $rootScope, $location, authentication) {
	  $scope.isLoggedIn = authentication.isLoggedIn();
	  $scope.currentUser = authentication.currentUser();

		$scope.signOut = function() {
			authentication.signOut();
			$rootScope.$broadcast('userLoggedOut'); // add an array of STRING to Config later
			$location.path('/');
		};

		// Where would be a good place to locate this $rootScope.$on()?
		$rootScope.$on('userLoggedIn', function() {
			// refresh navigation when an user is logged in
			$scope.isLoggedIn = authentication.isLoggedIn();
		  $scope.currentUser = authentication.currentUser();
		});

		$rootScope.$on('userLoggedOut', function() {
			// refresh navigation when an user is logged out
			$scope.isLoggedIn = authentication.isLoggedIn();
		  $scope.currentUser = authentication.currentUser();
		});
}]);

app.controller('listPostCtrl', ['$scope', '$location', '$resource', function($scope, $location, $resource) {
	var vm = this;
	var Post = $resource('/api/post/list');
	Post.query(function(data) {
		vm.posts = data;
		console.log(vm.posts);
	});
}]);

app.controller('uploadPostCtrl', ['$scope', '$resource', 'authentication', '$location', '$mdDialog', function($scope, $resource, authentication, $location, $mdDialog) {
	var vm = this;
	vm.readonly = false;
	vm.post = {
		postedBy : authentication.currentUser()._id, // this is important!
		title : "",
		isPrivate : "",
		content : "",
		// notekind : "",
		tags : []
	};

	vm.cancel = function() {
		$location.path('/');
		// console.log(vm.post.postedBy);
	};

	vm.upload = function() {
		var Post = $resource('/api/post/upload');
		var newPost = new Post(vm.post);

		newPost.$save(function(data) {
			console.log(data.title); // it works
			$location.path('/');
			// $rootScope.$broadcast('userLoggedIn');
		});
	};

	var originatorEv;
  vm.openMenu = function($mdOpenMenu, ev) {
    originatorEv = ev;
    $mdOpenMenu(ev);
  };
  vm.redial = function() {
    $mdDialog.show(
      $mdDialog.alert()
        .targetEvent(originatorEv)
        .clickOutsideToClose(true)
        .parent('body')
        .title('Suddenly, a redial')
        .textContent('You just called a friend; who told you the most amazing story. Have a cookie!')
        .ok('That was easy')
    );
    originatorEv = null;
  };
}]);

app.controller('secretCtrl', ['$location', 'getData', function($location, getData) {
	var vm = this;
  vm.user = {};

	// once getData.getProfile is called, it will return the user object if the user exists
	// but, how is it going to call or be linked to success or error function here?
  getData.getProfile()
  	.success(function(data) {
			console.log('getProfile successful');

      vm.user = data;
    })
    .error(function(err) {
      alert('secretCtrl error occurs : ' +err);
    });
}]);

app.controller('newpageCtrl', function($scope) {
	$scope.x = 1;
	$scope.test = function() {
		$scope.x++;
	};
});

app.controller('signInCtrl', ['$scope', '$location', '$rootScope', '$resource', 'authentication', function($scope, $location, $rootScope, $resource, authentication) {
	 var vm = this;
	 vm.credentials = {
		 email : "",
		 password : ""
	 };
	 vm.onSubmit = function() {
		 var User = $resource('/api/signin');
		 User.get(vm.credentials, function(data) { // this data is token passed from the server
			 authentication.saveToken(data.token);
			 $location.path('secretpage');
			 $rootScope.$broadcast('userLoggedIn');
		 });
	 };
}]);

app.controller('signUpCtrl',  ['$rootScope', '$location', '$resource', 'authentication', function($rootScope, $location, $resource, authentication) {
	var vm = this;
	vm.credentials = {
		name : "",
		email : "",
		password : ""
	};

	vm.onSubmit = function() {
		var User = $resource('/api/signup');
		var newUser = new User(vm.credentials);

		newUser.$save(function(data) {
			authentication.saveToken(data.token);
			$location.path('secretpage');
			$rootScope.$broadcast('userLoggedIn');
		});
	};
}]);
