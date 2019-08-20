const express = require("express");
const iterator = require("./iterator");
const library = require("./library");
const keyonRole = require("./role");
const util = require('util')

/**
 * Main schema controller
 */
class keyonController {
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
			maxPerPage: 100,
			lala: () => {}
		}

		/**
		 * List of builded roles
		 * @type {Object}
		 */
		this._roles = {}
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
	 * @return {keyonRole}      Role object
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

		this.driver = ko.db.get('mongodb');

		// run modelization
		this.driver.modelize(this);

		// prepare roles
		for(var role in this._root._roles) {
			// prepare schemas roles
			if(role == defaultRole) {
				const ret = iterator.assign(this.fields, (user, dst, object, source) => {
					// assign final schema field
					Object.assign(dst, object);

					// not needed anymore
					delete dst.$roles;
				});

				// prepare access
				const access = Object.assign({}, this._access)
				delete access.$roles;

				// create role object
				this._roles[role] = new keyonRole(this, role, access, ret);
			}
			else {
				const ret = iterator.assign(this.fields, (user, dst, object, source) => {
					// assign final schema field
					Object.assign(dst, object);

					if(object.$roles && object.$roles[role]) {
						// remove this one
						delete object.$roles[role].$kind;

						// assign role specific
						Object.assign(dst, object.$roles[role]);
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
				this._roles[role] = new keyonRole(this, role, access, ret);
			}
		}

		// prepare schemas roles

		// prepare the library
		//this.lib = new library(this);

		if(cb) cb();
	}
}

module.exports = keyonController;
