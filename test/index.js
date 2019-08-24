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

	it('should register new configuration variable', function(done) {
		keyon.configs.$fusion(
			"instance",
			1234,
			"Current instance"
		);
		done();
	});

	it('should set instance configuration variable', function(done) {
		keyon.configs.$set(
			"instance",
			4321
		);
		done();
	});

	it('should get correct configuration instance', function() {
		assert.ok(keyon.configs.$get("instance") == 4321)
	});

	// apply instance constraint
	
	// load roles test
	require("./role");
});


describe('Keyon Kernel Stopping', function() {
	it('should stop correctly the database connection', function(done) {
		keyon.$stop();
		done();
	});
});
