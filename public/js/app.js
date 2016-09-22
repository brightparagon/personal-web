'use strict';

// divide this file into several files on the basis of roles like controller, configuration, directive..

var app = angular.module('blogapp', ['ngResource', 'ngMessages', 'blog.configs']);

app.factory('Post', ['$resource', function($resource) {
  return $resource('/api/posts/:postId', {}, { update: { method: 'PUT' }, delete: { method: 'DELETE'} });
}]);

app.factory('PostsLoader', ['Post', '$q', function(Post, $q) {
  return function() {
    var delay = $q.defer();
    Post.query(function(posts) {
      delay.resolve(posts);
    }, function() {
      delay.reject('Unable to fetch posts');
    });
    return delay.promise;
  };
}]);

app.factory('PostLoader', ['Post', '$route', '$q', function(Post, $route, $q) {
  return function() {
    var delay = $q.defer();
    Post.get({postId: $route.current.params.postId}, function(post) {
      delay.resolve(post);
    }, function() {
      delay.reject('Unable to fetch post '  + $route.current.params.postId);
    });
    return delay.promise;

    // what is $route? & hot to use it with params --> TIL
    };
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
			// console.log('token : ' + token);

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
			// console.log('currentUser called');

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

app.controller('listPostCtrl', ['$scope', '$location', '$resource', 'posts', '$mdDialog', function($scope, $location, $resource, posts, $mdDialog) {
	var vm = this;
	var User = $resource('/api/user/:userId');
	vm.leftPosts = [];
	vm.rightPosts = [];

  // $scope.posts = $scope.posts.concat(result);

  // make this part as a TIL - how to pass the parameter to a callback

  for(var i = 0; i<posts.length; i++) {
  	if(i%2 === 0) {
  		vm.leftPosts.push(posts[i]);
  		(function(post) {
  			User.get({userId:post.postedBy}, function(user) {
  				post.writer = user.name;
				});
    	})(vm.leftPosts[i===0?0:i/2]);
		} else {
  		vm.rightPosts.push(posts[i]);
  		(function(post) {
  			User.get({userId:post.postedBy}, function(user) {
  				post.writer = user.name;
  			});
    	})(vm.rightPosts[i-1===0?0:(i-1)/2]);
  	}
	}
  // maybe there is a better way to relate the writer to every post
  // like fixing post schema - adding writer property referring to User Schema

  vm.showAdvanced = function(ev) {
    $mdDialog.show({
      controller: DialogController,
      templateUrl: 'viewPost.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
    });
    // .then(function(answer) {
    //   $scope.status = 'You said the information was "' + answer + '".';
    // }, function() {
    //   $scope.status = 'You cancelled the dialog.';
    // });
  };

  function DialogController(vm, $mdDialog) {
    // vm.hide = function() {
    //   $mdDialog.hide();
    // };

    vm.cancel = function() {
      $mdDialog.cancel();
    };

    vm.answer = function(answer) {
      $mdDialog.hide(answer);
    };
  }
}]);

app.controller('viewPostCtrl', ['$scope', 'authentication', '$location', 'post', 'Post', function($scope, authentication, $location, post, Post) {
	var vm = this;
  vm.post = post;

  vm.delete = function(postId) {

    // need to add an alert saying like 'are you sure to remove this post?'

    Post.delete({postId:postId}, function(err) {
      if(err) alert('delete error occurs');
      $location.path('/post/list');
    });
  };
}]);

app.controller('editPostCtrl', ['$scope', 'authentication', '$location', 'post', 'Post', function($scope, authentication, $location, post, Post) {
	var vm = this;
  vm.post = post;

  vm.update = function(postToUpdate) {
    Post.update({postId:postToUpdate.postId}, postToUpdate, function() {
      $location.path('/post/view/' + postToUpdate.postId);
    });
  };
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
	};

	vm.upload = function() {
		var Post = $resource('/api/post/upload');
		var newPost = new Post(vm.post);

		newPost.$save(function(data) {

			// $location.path -> synchronize immediately
			$location.path('/post/list');
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
      alert('secretCtrl error occurs : ' + err);
    });
		// the reason whay the result of getData.getProfile() can be linked to .success and .error
		// is that getProfile() returns $http object which uses ajax call that has functions above
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
