var app = angular.module('blogapp', ['ngRoute', 'ngResource']);

app.config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'home.html',
			controllerAs: 'vm'
		})
		.when('/newpage', {
			templateUrl: 'newpage.html',
			controller: 'NewpageCtrl',
			controllerAs: 'vm'
		})
		.when('/signin', {
			templateUrl: 'signin.html',
			controller: 'SignCtrl',
			controllerAs: 'vm'
		})
		.when('/secretpage', {
			templateUrl: 'secretpage.html',
			controller: 'UserCtrl',
			controllerAs: 'vm'
		})
		.otherwise({
			redirectTo: '/'
		});
}]);

app.factory('userService', ['$resource', function($resource) {
  return $resource('/api/users/:email', {}, {
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

app.controller('NewpageCtrl', function($scope) {
	$scope.x = 1;
	$scope.test = function() {
		$scope.x++;
	};
});

app.controller('SignCtrl',  ['$scope', '$location', '$routeParams', 'userService',
 'authentication', function($scope, $location, $routeParams, userService, authentication) {
	// 세션에 따라 home.html 버튼 다르게 보이기(로그인/글쓰기 버튼 등등) -> ngShow or ngHide ?
	// 정합성 검사는 여기서 한다

	var vm = this;

	vm.credentials = {
		name : "",
		email : "",
		password : ""
	};

	vm.onSubmit = function() {
		var newUser = new userService(vm.credentials);
		newUser.$save(function(user) {
			// console.log(user.email); // users.js(server side)의 res.json(user)

			authentication.saveToken(user.token); // save a token of a user

			$location.url('/');
		});
	}

	$scope.signin = function() {
		// 폼 모두 입력 했는지 검사(빈칸, 이메일 정합성 등)

		userService.get({
			email: $scope.user.email
		}, function(user) {
			console.log('Found ' + user.email);

			authentication.saveToken(user.token);

			$location.url('/');
		});
	};

	$scope.logout = function() {
		// 추가적인 로직이 필요할 수도 있다
		$window.localStorage.removeItem('mean-token');
		// 주입된 authentication에 $window가 있으면 작동될 것이고
		// 작동이 안되면 authentication service 로직에 logout 라우팅을 추가 해야된다
	}
}]);

// function _handleError(response) {
//   // TODO: 여기서 뭔가를 수행한다. 대부분 오류 페이지로 리디렉트한다.
//   console.log('%c ' + response, 'color:red');
// };
