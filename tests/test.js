var assert = require("assert");

describe('Array test', function() {
	describe('indexOf() method', function () {
		it('return -1 when data not exist', function () {
			assert.equal(-1, [1,2,3].indexOf(5));
			assert.equal(-1, [1,2,3].indexOf(0));
		});
	});
});
