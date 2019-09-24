const iterator = require("./iterator");
const filters = require("./filters");
const util = require('util')
const debug = require("debug")("keyon:controller");

/**
 * Role wrapper
 */
class keyonController {
	/**
	 * Construct a controller
	 * @param {keyonSchemaController} controller [description]
	 * @param {String} name Name of the role
	 */
	constructor(controller, name) {
		const self = this;

		this._controller = controller;
		this._name = name;

		debug("HAHAHAH");
	}

	$fusion(name, access) {
		
	}

}

module.exports = keyonController;
