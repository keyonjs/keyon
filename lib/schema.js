const express = require("express");
const iterator = require("./iterator");
const library = require("./library");
const keyonControllerRole = require("./controllerRole");
const keyonController = require("./controller");
const util = require('util')
const debug = require("debug")("keyon:schema");

/**
 * Main schema controller
 *
 * Regroup all schema controllers
 */
class keyonSchema {
	constructor(root, name, driver) {
		this._root = root;

		/**
		 * Pas sur que ce soit bon ca
		 * @type {express}
		 */
		this.router = new express.Router;

		/**
		 * Name of the controller
		 * @type {[type]}
		 */
		this.name = name;

		/**
		 * Selected data driver for the current controller
		 * @type {[type]}
		 */
		this.driver = null;

		/**
		 * Controller fields (all)
		 * @type {Object}
		 */
		this.fields = {}

		/**
		 * Current access model of the controller
		 * @type {Object}
		 */
		this._access = {
			available: false,
			noupdate: false,
			nocreate: false,
			nodelete: false,
			nolist: false,
			noget: false,
			nooptions: false,
			track: false,
			maxPerPage: 100
		}

		/**
		 * List of builded roles
		 * @type {Object}
		 */
		this._roles = {}

		debug("Creating new schema context #"+name);
	}

	/**
	 * Direct Access to the schema access
	 * @param  {[type]} options [description]
	 * @return {[type]}         [description]
	 */
	$access(options) {
		Object.assign(this._access, options);
	}

	/**
	 * Direct Access of the schema fusion
	 * @param  {[type]} fields Keyon Schema Definition
	 */
	$fusion(fields) {
		this.fields = iterator.fusion(this.fields, fields);
	}

	/**
	 * Manage an index for the schema
	 * @param  {Object} group Groupe of index
	 * @example
	 * keyon.$schemas.example.$index({ name: 1, type: -1 });
	 */
	$index(group) {

	}

	/**
	 * Get role handler for the current controller
	 * @param  {String} name Name of the role
	 * @return {keyonControllerRole}      Role object
	 */
	$role(name) {
		return(this._roles[name])
	}

	/**
	 * Direct Access Prepare schema to be used
	 * @param {cb} cb End callback
	 */
	_prepare(cb) {
		const ko = require("../index");

		const defaultRole = this._root.configs.$get("public role");

		// intializing ORM driver
		this.driver = ko.db.get('mongodb');

		// run modelization
		this.driver.modelize(this);

		// prepare roles
		for(var role in this._root._roles) {
			// prepare schemas roles using default role
			if(role == defaultRole) {

				const ret = iterator.assign(this.fields, (user, dst, object, source) => {
					// assign final schema field
					Object.assign(dst, object);

					// sanatize kind
					if(!object.$kind) {
						console.log("No $kind find in schema "+this.name+" for role "+role+" in "+source);
						process.exit(-1)
					}

					// resolv the type manager
					object.$kind._hdl = ko.types[object.$kind.type];
					if(!object.$kind._hdl) {
						console.log("Unknown type "+object.$kind.type+" in schema "+this.name+" for role "+role+" in "+source);
						process.exit(-1)
					}

					// not needed anymore
					delete dst.$roles;
				});

				// prepare access
				const access = Object.assign({}, this._access)
				delete access.$roles;

				// create role object
				this._roles[role] = new keyonControllerRole(this, role, access, ret);

				new keyonController(this._root, role);
			}
			// prepare schema with specific
			else {
				const ret = iterator.assign(this.fields, (user, dst, object, source) => {
					// assign final schema field
					Object.assign(dst, object);

					if(object.$roles && object.$roles[role]) {
						// remove this one
						delete object.$roles[role].$kind;

						// assign role specific
						Object.assign(dst, object.$roles[role]);

						// sanatize kind
						if(!object.$kind) {
							console.log("No $kind find in schema "+this.name+" for role "+role+" in "+source);
							process.exit(-1)
						}

						// resolv the type manager
						object.$kind._hdl = ko.types[object.$kind.type];
						if(!object.$kind._hdl) {
							console.log("Unknown type "+object.$kind.type+" in schema "+this.name+" for role "+role+" in "+source);
							process.exit(-1)
						}
					}

					// not needed anymore
					delete dst.$roles;
				});

				// prepare access
				const access = Object.assign({}, this._access)
				if(access.$roles && access.$roles[role]) {
					Object.assign(access, access.$roles[role])
				}
				delete access.$roles;

				// create role object
				this._roles[role] = new keyonControllerRole(this, role, access, ret);

				new keyonController(this._root, role);
			}
		}

		// prepare schemas roles

		// prepare the library
		//this.lib = new library(this);

		if(cb) cb();
	}
}

module.exports = keyonSchema;
