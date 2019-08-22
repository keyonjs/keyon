const assert = require('assert');
const keyon = require("../index");
const Types = keyon.types;

var doc;

describe('Role Interface', function() {

	it('should get schema admin role options', function(done) {
		const pipe = new keyon.pipeline("test", () => {
			const res = pipe.$result();
			if(res.error === true) {
				done("Errored");
				return;
			}
			done();
		});
		pipe.role = "admin";
		keyon.schemas.accounts.$role("admin").options(pipe);
		pipe.$fifo();
	});

	// create
	it('should create an entry following admin role', function(done) {
		const pipe = new keyon.pipeline("test", () => {
			const res = pipe.$result();
			if(res.error === true) {
				done("Errored");
				return;
			}
			doc = res.data._id;
			done();
		});
		pipe.role = "admin";
		pipe.body.name = "Michael VERGOZ";
		keyon.schemas.accounts.$role("admin").create(pipe);
		pipe.$fifo();
	});


	// update

/*
	// get
	it('should get an entry following admin role', function(done) {
		const pipe = new keyon.pipeline("test", () => {
			const res = pipe.$result();
			if(res.error === true) {
				done("Errored");
				return;
			}
			doc = res.data._id;
			done();
		});
		pipe.role = "admin";
		pipe.body.name = "Michael VERGOZ";
		keyon.schemas.accounts.$role("admin").create(pipe);
		pipe.$fifo();
	});
*/

	// list

	// delete


});
