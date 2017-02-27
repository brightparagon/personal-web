'use strict';
var app = angular.module('blogapp', ['ngResource', 'ngMessages', 'blog.configs']);

app.factory('Post', ['$resource', function($resource) {
  return $resource('/api/posts/:postId', {}, {update: {method: 'PUT'}});
}]);

app.factory('PostsPaged', ['$resource', function($resource) {
  return $resource('/api/posts/paged/:page');
}]);

app.factory('GetNumOfPosts', ['$resource', function($resource) {
  return $resource('/api/posts');
}]);

app.factory('PostsLoader', ['PostsPaged', '$q', function(PostsPaged, $q) {
  return function() {
    var delay = $q.defer();
    PostsPaged.query({page: 1}, function(firstPosts) {
      delay.resolve(firstPosts);
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
      delay.reject('Unable to fetch post ' + $route.current.params.postId);
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

app.controller('navCtrl', ['$scope', '$rootScope', '$location',
  'authentication', '$mdDialog', function($scope, $rootScope,
    $location, authentication, $mdDialog) {
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
  		$rootScope.$broadcast('userLoggedOut');
  		$location.path('/');
    }, function() {
      // cancel
    });
	};

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

app.controller('footerCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
  $rootScope.imagePath = "bootstrap/blog/img/bottom-bg.png";
}]);

app.controller('homeCtrl', ['$scope', '$rootScope', '$location',
  'authentication', function($scope, $rootScope, $location, authentication) {
  $scope.isLoggedIn = authentication.isLoggedIn();
  $rootScope.$on('userLoggedOut', function() {
		$scope.isLoggedIn = authentication.isLoggedIn();
	});
}]);

app.controller('listPostCtrl', ['$scope', '$rootScope', '$interval', '$location',
  '$resource', 'posts', 'Post', 'PostsPaged', 'GetNumOfPosts', '$mdDialog',
    function($scope, $rootScope, $interval, $location, $resource, posts,
      Post, PostsPaged, GetNumOfPosts, $mdDialog) {
  var User = $resource('/api/user/:userId');
	var vm = this;
  vm.posts = posts;
  vm.currentPage = 1;
  GetNumOfPosts.get(function(result) {
    vm.lastPage = Math.ceil(result.result/5);
  });
  vm.isLast = false;
  vm.activated = false;
  vm.determinateValue = 30;
  $interval(function() {
    vm.determinateValue += 1;
    if (vm.determinateValue > 100) {
      vm.determinateValue = 30;
    }
  }, 100);

  vm.showPost = function(ev, postId) {
    var post = Post.get({postId:postId});
    $mdDialog.show({
      controller: viewPostCtrl,
      templateUrl: 'viewPost.html',
      locals: {
        post: post
      },
      parent: angular.element(document.body),
      targetEvent: ev,
      fullscreen: true,
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
        Post.delete({postId: postId}, function(response) {
          $rootScope.$broadcast('postDeleted');
          $mdDialog.show(
            $mdDialog.alert()
              .clickOutsideToClose(true)
              .title('Your post is deleted successfully.')
              .textContent('')
              .ariaLabel('Post Deletion Failed Dialog')
              .ok('Got it')
          );
        });
      }, function() {
        // cancel
      });
    };
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
  };

  vm.nextPage = function() {
    PostsPaged.query({page: ++vm.currentPage}, function(postsToAttatch) {
      vm.posts = vm.posts.concat(postsToAttatch);
      vm.isLast = vm.currentPage === vm.lastPage ? true : false;
      // Angular Progressive Circle doesn't work
      vm.activated = true;
    });
	};

  $rootScope.$on('postDeleted', function() {
    Post.query(function(posts) {
      vm.posts = posts;
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
  vm.theme = 'dark-blue';
  vm.user = {};
  getData.getProfile()
  	.success(function(data) {
      vm.user = data;
    })
    .error(function(err) {
      alert('secretCtrl error occurs : ' + err);
    });
}]);

app.controller('signInCtrl', ['$scope', '$location', '$rootScope', '$resource', 'authentication', '$mdDialog', function($scope, $location, $rootScope, $resource, authentication, $mdDialog) {
	 var vm = this;
	 vm.credentials = {
		 email : "",
		 password : ""
	 };
	 vm.onSubmit = function() {
		 var User = $resource('/api/signin');
		 User.get(vm.credentials, function(data) {
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
		 }, function(err) {
       $mdDialog.show(
         $mdDialog.alert()
           .clickOutsideToClose(true)
           .title("Couldn't Sign In: " + err.data.message)
           .ariaLabel('Sign In Failed')
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
      $mdDialog.show(
        $mdDialog.alert()
          .clickOutsideToClose(true)
          .title('You are signed up successfully!')
          .ariaLabel('Sign Up Dialog')
          .ok('Got it!')
      );
		});
	};
}]);

app.run(['$rootScope', '$location', 'authentication',
	function($rootScope, $location, authentication) {
	$rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute) {
		// every move or change to any pages will be calling this $on(it is made to do that)
		// even the first access to this web will call this method
	  if($location.path() === '/secretpage' && !authentication.isLoggedIn()) {
	  	$location.path('/');
    }
  });
}]);
