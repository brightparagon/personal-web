var assert = require('expect.js');
var resource = require('angular-resource');


describe('Post test', function() {

  before(function() {
    var posts = [];
    var Post = $resource('/api/post/list');
    Post.query(function(data) {
      posts = data;
    });
  });

	describe('getPosts() method', function() {
		it('should return an array', function () {
      expect(Array.isArray(posts)).to.be.true;
		});
	});

});
