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

app.controller('homeCtrl', ['$scope', '$rootScope', '$location', 'authentication', function($scope, $rootScope, $location, authentication) {
  $scope.isLoggedIn = authentication.isLoggedIn();
  $rootScope.$on('userLoggedOut', function() {
		$scope.isLoggedIn = authentication.isLoggedIn();
	});
}]);

app.controller('navCtrl', ['$scope', '$rootScope', '$location', 'authentication', '$mdDialog', function($scope, $rootScope, $location, authentication, $mdDialog) {
	$scope.isLoggedIn = authentication.isLoggedIn();
	$scope.currentUser = authentication.currentUser();
	$scope.signOut = function() {
    var confirm = $mdDialog.confirm()
      .title('Are you sure to sign out?')
      .textContent('')
      .ariaLabel('Sign Out Dialog')
      .ok('Yes')
      .cancel('Cancel');
    $mdDialog.show(confirm).then(function() {
      // ok
      $mdDialog.show(
        $mdDialog.alert()
          .clickOutsideToClose(true)
          .title('You are signed out.')
          .textContent('')
          .ariaLabel('Sign Out Completed Dialog')
          .ok('Got it!')
      );
      authentication.signOut();
  		$rootScope.$broadcast('userLoggedOut'); // add an array of STRING to Config later
  		$location.path('/');
    }, function() {
      // cancel
    });
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

app.controller('listPostCtrl', ['$scope', '$rootScope', '$location', '$resource', 'posts', 'Post', '$mdDialog', function($scope, $rootScope, $location, $resource, posts, Post, $mdDialog) {
	var vm = this;
  vm.posts = [];
	var User = $resource('/api/user/:userId');

  for(var i = 0; i<posts.length; i++) {
    // to attach user name on each post
		vm.posts.push(posts[i]);
		(function(post) {
			User.get({userId:post.postedBy}, function(user) {
				post.writer = user.name;
			});
  	})(vm.posts[i]);
  }

  vm.showAdvanced = function(ev, postId) {
    var post = Post.get({postId:postId});
    $mdDialog.show({
      controller: viewPostCtrl,
      templateUrl: 'viewPost.html',
      locals: {
        post: post
      },
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true
    });
    // .then(function(answer) {
    //   $scope.status = 'You said the information was "' + answer + '".';
    // }, function() {
    //   $scope.status = 'You cancelled the dialog.';
    // });
  };

  function viewPostCtrl($scope, $location, post) {
    $scope.post = post;
    $scope.edit = function(postId) {
      $mdDialog.cancel();
      $location.path('/posts/edit/' + postId);
    };
    $scope.delete = function(postId) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure to remove this post?')
        .textContent('')
        .ariaLabel('Delete Confirm Dialog')
        .ok('Yes')
        .cancel('Cancel');
      $mdDialog.show(confirm).then(function() {
        // ok
        Post.delete({postId:postId}, function(error) {
          if(error) {
            $mdDialog.show(
              $mdDialog.alert()
                .clickOutsideToClose(true)
                .title('An error occured while deleting your post.')
                .textContent('')
                .ariaLabel('Post Deletion Failed Dialog')
                .ok('Got it')
            );
          } else {

            // it doesn't come to this point
            console.log('broadcast postDeleted');
            $rootScope.$broadcast('postDeleted');

          }
        });
      }, function() {
        // cancel
      });
    };
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
  };
  $rootScope.$on('postDeleted', function() {
    Post.query(function(posts) {
      vm.posts = posts;
      $mdDialog.show(
        $mdDialog.alert()
          .clickOutsideToClose(true)
          .title('Your post is deleted successfully.')
          .textContent('')
          .ariaLabel('Post Deletion Completed Dialog')
          .ok('Got it')
      );
      $location.path('/posts/list');
    });
	});
}]);

app.controller('editPostCtrl', ['$scope', 'authentication', '$location', 'post', 'Post', '$mdDialog', function($scope, authentication, $location, post, Post, $mdDialog) {
	var vm = this;
  vm.post = post;
  vm.edit = function(postToUpdate) {
    Post.update({postId:postToUpdate._id}, postToUpdate, function(updatedPost) {
      // $location.path('/post/view/' + postToUpdate.postId);
      $mdDialog.show(
        $mdDialog.alert()
          .clickOutsideToClose(true)
          .title('Your post is updated successfully.')
          .textContent('')
          .ariaLabel('Post Update Completed Dialog')
          .ok('Got it')
      );
      $location.path('/posts/list');
    });
  };
  vm.cancel = function() {
    $location.path('/posts/list');
  };
}]);

app.controller('uploadPostCtrl', ['$scope', '$resource', 'authentication', '$location', 'Post', '$mdDialog', function($scope, $resource, authentication, $location, Post, $mdDialog) {
	var vm = this;
	vm.readonly = false;
	vm.post = {
		postedBy : authentication.currentUser()._id,
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
		var newPost = new Post(vm.post);
		newPost.$save(function(data) {
      $mdDialog.show(
        $mdDialog.alert()
          .clickOutsideToClose(true)
          .title('Your post is uploaded successfully.')
          .textContent('')
          .ariaLabel('Post Upload Completed Dialog')
          .ok('Got it')
      );
			$location.path('/posts/list');
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

app.controller('signInCtrl', ['$scope', '$location', '$rootScope', '$resource', 'authentication', '$mdDialog', function($scope, $location, $rootScope, $resource, authentication, $mdDialog) {
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
       $mdDialog.show(
         $mdDialog.alert()
           .clickOutsideToClose(true)
           .title('You are signed in now!')
           .textContent('')
           .ariaLabel('Sign In Dialog')
           .ok('Got it!')
       );
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
