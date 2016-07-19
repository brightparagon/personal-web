var app = angular.module('blogapp', ['ngRoute', 'ngResource']);

app.config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'home.html',
			controller: 'mainCtrl',
			controllerAs: 'vm'
			// this vm is used by angular.js as the object in html to controll data
		})
		.when('/newpage', {
			templateUrl: 'newpage.html',
			controller: 'newpageCtrl',
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
		.otherwise({
			redirectTo: '/'
		});
}]);

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

app.directive('navigation', function navigation() {
	return {
		restrict: 'EA',
		templateUrl: 'navigation.html',
		controller: 'navigationCtrl',
		controllerAs: 'navvm'
	};
});

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

// modify it
app.factory('userService', ['$resource', function($resource) {
  return $resource('/api', {}, { // url part maybe needs fixing
		save: {
			method: 'POST'
		},
    update: {
      method: 'PUT'
    },
		get: {
			method: 'GET'
		}
  });
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

app.controller('mainCtrl', ['$scope', '$location', 'authentication', function($scope, $location, authentication) {
	var vm = this;
}]);

app.controller('navigationCtrl', ['$rootScope', '$location', 'authentication', function($rootScope, $location, authentication) {
		var vm = this;
	  vm.isLoggedIn = authentication.isLoggedIn();
	  vm.currentUser = authentication.currentUser();

		vm.signOut = function() {
			authentication.signOut();
			$rootScope.$broadcast('userLoggedOut'); // add an array of STRING to Config later
			$location.path('/');
			// $location.url('/');
		};

		$rootScope.$on('userLoggedIn', function() {
			// refresh navigation when an user logs in
			vm.isLoggedIn = authentication.isLoggedIn();
		  vm.currentUser = authentication.currentUser();
		});

		$rootScope.$on('userLoggedOut', function() {
			// refresh navigation when an user logs out
			vm.isLoggedIn = authentication.isLoggedIn();
		  vm.currentUser = authentication.currentUser();
		});
}]);

app.controller('secretCtrl', ['$location', 'getData', function($location, getData) {
	var vm = this;
  vm.user = {};

	// once getData.getProfile is calle, it will return the user object if the user exists
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

app.controller('signInCtrl', ['$scope', '$location', '$routeParams', 'userService', 'authentication', function($scope, $location, $routeParams, userService, authentication) {
	 var vm = this;
	 vm.credentials = {
		 email : "",
		 password : ""
	 };
	 vm.onSubmit = function() {
		 // need to check whether all forms are written

		 // need modification after understanding how to connect with passport(server-side)
		 userService.get(vm.credentials, function(data) {
			 authentication
			 	.saveToken(data.token)
				.error(function(err) {
					alert(err);
				})
				.then(function() {
					$location.path('secretpage');
					// how to move to /secretpage ? both html & route
					// is it interrelated with $resource?
					// answer : this is done by $location helper object
					// see the functions like $location.url(), path() in the Node.js doc page
				});
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
		// need to check whether all forms are written

		var User = $resource('/api/signup');
		var newUser = new User(vm.credentials);

		newUser.$save(function(data) {
			authentication.saveToken(data.token);
			$location.path('secretpage');
			$rootScope.$broadcast('userLoggedIn');
		});

		// var newUser = new userService(vm.credentials);
		// var newUser = $resource('/api/signup');
		// newUser.$save(vm.credentials, function(data) {
		// 	// console.log(user.email); // users.js(server side)의 res.json(user)
		//
		// 	authentication
		// 		.saveToken(data.token) // save a token of a user
		// 		.error(function(err) {
		// 			alert(err);
		// 		})
		// 		.then(function() {
		// 			$location.path('secretpage');
		// 			// $location.url('/api/users/secretpage');
		// 		});
		// });
	};
}]);
