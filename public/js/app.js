var app = angular.module('blogapp', ['ngRoute', 'ngResource']);

app.config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'home.html'
		})
		.when('/newpage', {
			templateUrl: 'newpage.html'
		})
		.otherwise({
			redirectTo: '/'
		});
}]);

// app.controller('mainCtrl', function($scope) {
// 	$scope.x = 1;
// 	$scope.test = function() {
// 		$scope.x++;
// 	};
// })
