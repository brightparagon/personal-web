var app = angular.module('blogapp', ['ngRoute', 'ngResource']);

app.config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'home.html',
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

app.directive('navigation', function navigation() {
	return {
		restrict: 'EA',
		templateUrl: 'navigation.html',
		controller: 'navigationCtrl as navvm'
	};
});

app.factory('userService', ['$resource', function($resource) {
  return $resource('/api/users/', {}, { // url part maybe needs fixing
		// can :email be ignored? like /api/users/secret ?

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

app.service('getData', ['$resource', 'authentication', // can use userService instead of $resouce
	function($resource, authentication) {
	var getProfile = function () {
	  return $resource.get('/api/users/secretpage', {
	    headers: {
	      Authorization: 'Bearer '+ authentication.getToken()
	    } // how this "headers" works?
	  });
  };

  return {
    getProfile : getProfile
  };
}]);

app.service('authentication', ['$http', '$window', function($http, $window) {
	var saveToken = function(token) {
		$window.localStorage['user-token'] = token;
	};

	var getToken = function() {
		return $window.localStorage['user-token'];
	};

	var isLoggedIn = function() {
		var token = getToken();
		var payload;

		if(token) {
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
			var token = getToken();
			var payload = token.split('.')[1];
			payload = $window.atob(payload);
			payload = JSON.parse(payload);

			return {
				email : payload.email
			};
		}
	};

	return {
    currentUser : currentUser,
    saveToken : saveToken,
    getToken : getToken,
    isLoggedIn : isLoggedIn
  };
}]);

app.controller('navigationCtrl', ['$location', 'authentication',
	function($location, authentication) {
		var vm = this;
	  vm.isLoggedIn = authentication.isLoggedIn();
	  vm.currentUser = authentication.currentUser();
}]);

app.controller('secretCtrl', ['$location', 'getData', function($location, getData) {
	var vm = this;
  vm.user = {};
  getData.getProfile()
  	.success(function(data) {
      vm.user = data;
    })
    .error(function(err) {
      alert(err);
    });
}]);

app.controller('newpageCtrl', function($scope) {
	$scope.x = 1;
	$scope.test = function() {
		$scope.x++;
	};
});

app.controller('signInCtrl', ['$scope', '$location', '$routeParams', 'userService',
	'authentication', function($scope, $location, $routeParams, userService, authentication) {
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
					$location.path('/secretpage');
					// how to move to /secretpage ? both html & route
					// is it interrelated with $resource?
				});
		 });
	 };
}]);

app.controller('signUpCtrl',  ['$scope', '$location', '$routeParams', 'userService',
	'authentication', function($scope, $location, $routeParams, userService, authentication) {
	var vm = this;
	vm.credentials = {
		name : "",
		email : "",
		password : ""
	};

	vm.onSubmit = function() {
		// need to check whether all forms are written

		// till here working
		
		var newUser = new userService(vm.credentials);
		newUser.$save(function(data) {
			// console.log(user.email); // users.js(server side)의 res.json(user)

			authentication
				.saveToken(data.token) // save a token of a user
				.error(function(err) {
					alert(err);
				})
				.then(function() {
					// $location.path('secretpage'); // does it work? -> check
					$location.path('/secretpage');
				});
		});
	};

	$scope.logout = function() {
		// mayby additional logic is needed
		$window.localStorage.removeItem('mean-token');
		// 주입된 authentication에 $window가 있으면 작동될 것이고
		// 작동이 안되면 authentication service 로직에 logout 라우팅을 추가 해야된다
	};
}]);

app.run(['$rootScope', '$location', 'authentication',
	function($rootScope, $location, authentication) {
	$rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute) {
	  if ($location.path() === '/secretpage' && !authentication.isLoggedIn()) {
	  	$location.path('/');
    }
  });
}]);

// function _handleError(response) {
//   // TODO: 여기서 뭔가를 수행한다. 대부분 오류 페이지로 리디렉트한다.
//   console.log('%c ' + response, 'color:red');
// };
