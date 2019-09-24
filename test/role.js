const assert = require('assert');
const keyon = require("../index");
const Types = keyon.types;

var doc;
var raw;

describe('Schemas > Controller > Role: Library', function() {

	describe('Admin Options', function() {
		it('should get schema admin role options', function(done) {
			const pipe = new keyon.pipeline("test", () => {
				const res = pipe.$result();
				if(res.error === true) {
					done("Errored #"+res.code+": "+res.message);
					return;
				}
				done();
			});
			pipe.role = "admin";
			keyon.schemas.accounts.$role("admin").options(pipe);
			pipe.$fifo();
		});
	})

	describe('Admin Creation', function() {
		// create
		it('should generate an error while creation', function(done) {
			const pipe = new keyon.pipeline("test", () => {
				const res = pipe.$result();
				if(res.error !== true) {
					done("Test not errored");
					return;
				}
				done();
			});
			pipe.role = "admin";
			pipe.body.name = "Michael VERGOZ";
			keyon.schemas.accounts.$role("admin").create(pipe);
			pipe.$fifo();
		});

		// create
		it('should create an entry following admin role', function(done) {
			const pipe = new keyon.pipeline("test", () => {
				const res = pipe.$result();
				if(res.error === true) {
					done("Errored #"+res.code+": "+res.message);
					return;
				}
				doc = res;
				raw = pipe.rawResult;
				done();
			});

			pipe.role = "admin";
			pipe.body.name = "Michael VERGOZ";
			pipe.body.email = "m.vergoz@vergoz.ch";
			pipe.body.address = {
				street: "Somewhere"
			}
			pipe.body.phone = [
				"+456789",
				"+5635728"
			]
			pipe.body.stuff = [
				{description: "Stuff #1", note: "Note for stuff 1"},
				{description: "Stuff #2", note: "Note for stuff 2"}
			]

			keyon.schemas.accounts.$role("admin").create(pipe);
			pipe.$fifo();
		});

		it('created document should have data object', function() {
			assert.ok(typeof doc.data == "object");
		})

		it('created document should have 2 phones', function() {
			assert.ok(doc.data.phone.length == 2);
		})

		it('created document should have 2 stuffs', function() {
			assert.ok(doc.data.stuff.length == 2);
		})

		it('created document should have good value in first array', function() {
			assert.ok(doc.data.stuff[0].description == "Stuff #1");
			assert.ok(doc.data.stuff[0].note == "Note for stuff 1");
		})

		it('created document should have not mongo ID', function() {
			assert.ok(!doc.data._id);
		})

		it('created document should have an ID', function() {
			assert.ok(doc.data.id);
		})

		it('created document should have mongo ID inside RAW', function() {
			assert.ok(raw.data._id);
		})

		it('should create 10 accounts', function(done) {
			var index = 10;
			function createAccount() {
				if(index == 0) {
					done();
					return;
				}

				const pipe = new keyon.pipeline("test", () => {
					const res = pipe.$result();
					if(res.error === true) {
						done("Errored #"+res.code+": "+res.message);
						return;
					}
					index--;
					process.nextTick(createAccount)
				});

				pipe.role = "admin";
				pipe.body.name = "Michael VERGOZ ("+index+")";
				pipe.body.email = "m.vergoz@vergoz.ch";
				keyon.schemas.accounts.$role("admin").create(pipe);
				pipe.$fifo();
			}

			createAccount();
		});



	})

	// get
	describe('Admin Getter', function() {
		// create
		it('should get a document', function(done) {
			const pipe = new keyon.pipeline("test", () => {
				const res = pipe.$result();
				if(res.error === true) {
					done("Errored #"+res.code+": "+res.message);
					return;
				}
				doc = res;
				raw = pipe.rawResult;
				done();
			});

			pipe.params.id = doc.data.id;
			keyon.schemas.accounts.$role("admin").get(pipe);
			pipe.$fifo();
		});

		it('getter document should have data object', function() {
			assert.ok(typeof doc.data == "object");
		})

		it('getter document should have 2 phones', function() {
			assert.ok(doc.data.phone.length == 2);
		})

		it('getter document should have 2 stuffs', function() {
			assert.ok(doc.data.stuff.length == 2);
		})

		it('getter document should have good value in first array', function() {
			assert.ok(doc.data.stuff[0].description == "Stuff #1");
			assert.ok(doc.data.stuff[0].note == "Note for stuff 1");
		})

		it('getter document should have not mongo ID', function() {
			assert.ok(!doc.data._id);
		})

		it('getter document should have an ID', function() {
			assert.ok(doc.data.id);
		})

		it('getter document should have mongo ID inside RAW', function() {
			assert.ok(raw.data._id);
		})
	})

	describe('Admin Update', function() {
		it('should update a document', function(done) {
			const pipe = new keyon.pipeline("test", () => {
				const res = pipe.$result();
				if(res.error === true) {
					done("Errored #"+res.code+": "+res.message);
					return;
				}
				doc = res;
				raw = pipe.rawResult;
				done();
			});

			pipe.params.id = doc.data.id;
			pipe.body.email = "test@test.com";
			pipe.body.name = "Field Update";
			keyon.schemas.accounts.$role("admin").update(pipe);
			pipe.$fifo();
		});

		it('email address should not changes', function() {
			assert.ok(doc.data.email != "test@test.com");
		})

		it('updated value has changed', function() {
			assert.ok(doc.data.name == "Field Update");
		})

		it('updated document should have not mongo ID', function() {
			assert.ok(!doc.data._id);
		})

		it('updated document should have an ID', function() {
			assert.ok(doc.data.id);
		})

		it('getter document should have 2 phones', function() {
			assert.ok(doc.data.phone.length == 2);
		})

		it('getter document should have 2 stuffs', function() {
			assert.ok(doc.data.stuff.length == 2);
		})

		it('getter document should have good value in first array', function() {
			assert.ok(doc.data.stuff[0].description == "Stuff #1");
			assert.ok(doc.data.stuff[0].note == "Note for stuff 1");
		})
	})

	describe('Admin Delete', function() {
		it('should delete a document', function(done) {
			const pipe = new keyon.pipeline("test", () => {
				const res = pipe.$result();
				if(res.error === true) {
					done("Errored #"+res.code+": "+res.message);
					return;
				}
				done();
			});

			pipe.params.id = doc.data.id;
			keyon.schemas.accounts.$role("admin").delete(pipe);
			pipe.$fifo();
		});
	})

	describe('Admin List', function() {
		it('should list documents without any filter/search', function(done) {
			const pipe = new keyon.pipeline("test", () => {
				const res = pipe.$result();
				if(res.error === true) {
					done("Errored #"+res.code+": "+res.message);
					return;
				}
				console.log("list", res.data);
				done();
			});

			keyon.schemas.accounts.$role("admin").list(pipe);
			pipe.$fifo();
		});
	})

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
