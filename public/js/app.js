var app = angular.module('blogapp', ['ngRoute', 'ngResource', 'ngCookies']);

app.config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'home.html'
		})
		.when('/newpage', {
			templateUrl: 'newpage.html',
			controller: 'NewpageCtrl'
		})
		.when('/signin', {
			templateUrl: 'signin.html',
			controller: 'SignCtrl'
		})
		.otherwise({
			redirectTo: '/'
		});
}]);

app.factory('userService', ['$resource', function($resource) {
  return $resource('/users/:userEmail', {}, {
		save: { // action 이름은 사용자 정의
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

app.controller('NewpageCtrl', function($scope) {
	//for a test
	$scope.x = 1;
	$scope.test = function() {
		$scope.x++;
	};
});

app.controller('SignCtrl',  ['$scope', '$location', '$routeParams', 'userService', function($scope, $location, $routeParams, userService) {
	//세션에 따라 home.html 버튼 다르게 보이기(로그인/글쓰기 버튼 등등)

	$scope.signin = function() {
		// 폼 모두 입력 했는지 검사(빈칸, 이메일 정합성 등)

		userService.get({
			email: $scope.user.email
		}, function(user) {
			console.log('Found ' + user.email);
			$location.url('/');
		});
	};

	$scope.signup = function() {
		var userInstance = {
			email: $scope.user.email,
			password: $scope.user.password
		};
		var newUser = new userService(userInstance); //userService = $resource
		newUser.$save(function(user) {
			// console.log(user.email); // users.js(server side)의 res.json(user)
			$scope.user.email = '';
			$scope.user.password = '';
			$location.url('/');
		});
	};
}]);

// function _handleError(response) {
//   // TODO: 여기서 뭔가를 수행한다. 대부분 오류 페이지로 리디렉트한다.
//   console.log('%c ' + response, 'color:red');
// };
