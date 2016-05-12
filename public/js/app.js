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

app.controller('NewpageCtrl', function($scope) {
	//컨트롤러 테스트용
	$scope.x = 1;
	$scope.test = function() {
		$scope.x++;
	};
})

app.controller('SignCtrl', function($scope) {
	//mongodb 연결 뒤 user 저장
	//세션 유지는 어떻게 하나?
	//세션에 따라 home.html 버튼 다르게 보이기(로그인/글쓰기 버튼 등등)
})
