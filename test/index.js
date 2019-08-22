const assert = require('assert');
const keyon = require("../index");
const Types = keyon.types;

const crypto = require("crypto");

crypto.sum = (d) => {
	const hash = crypto.createHash("sha256");
	hash.update(d);
	return(hash.digest(hex))
}

require("./building");


describe('Keyon Kernel', function() {
	it('should register modeled building', function(done) {
		keyon.$register(() => {
			done();
		});
	});

	require("./role");
});


describe('Keyon Kernel Stopping', function() {
	it('should stop correctly the database connection', function(done) {
		keyon.$stop();
		done();
	});
});
