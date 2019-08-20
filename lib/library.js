class keyonLibrary {
	/**
	 * Create a library interface
	 * @param {keyonController} controller Controller to be use
	 */
	constructor(controller) {
		this._controller = controller;
	}

	/**
	 * Return schema informations, used to drive UIs
	 * @param  {Function} cb [description]
	 * @return {[type]}      [description]
	 */
	option(cb) {

	}

	list(data, cb) {

	}

	get(uuid, cb) {

		/*
		* driver.**cleanUUIDCopy()**
		* schema.**onGetEarly()**
		* driver.get()
		* driver.**cleanOutput()**
			* field.**onFormat()**
		* schema.**onGetLate()**
		*/
	}

	create(uuid, data, cb) {

	}

	update(uui, data, cb) {

	}

	delete(uuid) {

	}
}

module.exports = keyonLibrary;
