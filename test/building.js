const assert = require('assert');
const keyon = require("../index");
const Types = keyon.types;

describe('Building Pass', function() {
	it('should initialize main interface', function(done) {
		keyon.$init({
			'name': 'My Site',
			'brand': 'My Site',
		})

		assert.equal(keyon.configs.$get("name"), 'My Site');
		assert.equal(keyon.configs.$get("brand"), 'My Site');
		done();
	});

	it('should reference an account schema', function(done) {
		keyon.schemas.$fusion('accounts', {
			name: {
				$label: "Text",
				$kind: {
					type: "Text"
				},
			},
		})

		assert.ok(keyon.schemas.accounts.name === 'accounts');
		done();
	});

	it('should extend account schema with roles', function(done) {
		keyon.schemas.$fusion('accounts', {
			name: {
				$roles: {
					admin: {
						$sort: true,
						$nocreate: false,
						$noupdate: false,
						$hidden: false,
					}
				},

				$sort: false,
				$nocreate: true,
				$noupdate: true,
				$hidden: true,
			},
		})
		const fields = keyon.schemas.accounts.fields
		assert.ok(fields.name.$sort === false);
		assert.ok(fields.name.$nocreate === true);
		assert.ok(fields.name.$noupdate === true);
		assert.ok(fields.name.$hidden === true);
		done();
	});


	it('should set schema access (role based)', function(done) {
		keyon.schemas.$access('accounts', {
			$roles: {
				admin: {
					available: true,
					noupdate: false,
					nocreate: false,
					nodelete: false,
					nolist: false,
					noget: false,
				}
			},
		})
		const access = keyon.schemas.accounts._access;
		assert.ok(access.available === false);
		assert.ok(access.noupdate === false);
		assert.ok(access.nocreate === false);
		assert.ok(access.nodelete === false);
		assert.ok(access.nolist === false);
		assert.ok(access.noget === false);
		assert.ok(access.nooptions === false);
		assert.ok(access.track === false);

		done();
	});

});
