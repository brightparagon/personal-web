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

app.factory('UserService', ['$resource', function($resource) {
  return $resource('/users/:userId', {}, {
		create: {
			method: 'POST'
		},
    update: {
      method: 'PUT'
    }
  });
}]);

app.controller('NewpageCtrl', function($scope) {
	//컨트롤러 테스트용
	$scope.x = 1;
	$scope.test = function() {
		$scope.x++;
	};
})

app.controller('SignCtrl',  ['$scope', '$routeParams', 'UserService', function($scope, $routeParams, userService) {
	//mongodb 연결 뒤 user 저장
	//세션 유지는 어떻게 하나?
	//세션에 따라 home.html 버튼 다르게 보이기(로그인/글쓰기 버튼 등등)

	$scope.signup = function() {
		var userInstance = {
			email: $scope.email,
			password: $scope.password
		}
		userService.create(userInstance, function() {
			console.log('the user is made');
		});
	};
}])

function _handleError(response) {
  // TODO: 여기서 뭔가를 수행한다. 대부분 오류 페이지로 리디렉트한다.
  console.log('%c ' + response, 'color:red');
}
