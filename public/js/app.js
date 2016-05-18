var app = angular.module('blogapp', ['ngRoute', 'ngResource']);

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
  return $resource('/users/:userId', {}, {
		save: { // action 이름은 사용자 정의
			method: 'POST'
		},
    update: {
      method: 'PUT'
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
	//how to maintain a session of user?
	//세션에 따라 home.html 버튼 다르게 보이기(로그인/글쓰기 버튼 등등)

	$scope.signup = function() {
		//can this part be out of this function?
		var userInstance = {
			email: $scope.user.email,
			password: $scope.user.password
		};
		//
		var newUser = new userService(userInstance);
		newUser.$save(function() {
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
