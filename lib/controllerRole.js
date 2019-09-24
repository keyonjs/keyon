// TOBE DELETED

const iterator = require("./iterator");
const filters = require("./filters");
const util = require('util')

const optionsToCopy = [
	'$label',
	'$help',
	'$kind',
	'$noupdate',
	'$nocreate',
	'$required',
	'$initial',
	'$sort',
	'$listPopulate',
	'$getPopulate',
]

/**
 * Role wrapper
 */
class keyonControllerRole {
	/**
	 * Construct a role
	 * @param {keyonSchemaController} controller [description]
	 * @param {String} name Name of the role
	 * @param {Object} access Object access
	 * @param {Object} fields Parametrable fields
	 */
	constructor(controller, name, access, fields) {
		const self = this;

		this._filters = new filters(name, fields);

		this._controller = controller;
		this._name = name;
		this._access = access;
	}

	/**
	 * Return schema informations, used to drive UIs
	 *
	 * * schema.**onOptionsEarly()**
	 * * schema.**options()**
	 * * schema.**onOptionsLate()**
	 * @param  {keyonPipeline} pipe Related pipeline
	 */
	options(pipe, end) {

		const access = this._access;
		const self = this;

		// check availability
		if(this._access.available !== true || this._access.nooptions === true) {
			pipe.$error(403, "Resource not available");
			pipe.$end();
			return;
		}

		const binded = pipe.$fifo.bind(pipe);

		// exec early options
		if(access.onOptionsEarly) {
			pipe.$push(() => {
				access.onOptionsEarly(pipe, binded)
			})
		}

		// options task
		pipe.$push(() => {
			const res = {
				access: {},
				schema: {}
			}

			// get access specification
			for(var name in access) {
				const ptr = access[name];
				if(typeof ptr !== "function") res.access[name] = ptr;
			}

			// get schema specifications
			res.schema = iterator.assign(self._fields, (user, dst, object, source) => {
				if(object.$hidden === true) return;

				// assign final schema field
				for(var a in optionsToCopy) {
					const k = optionsToCopy[a];
					if(!object[k]) continue;
					if(typeof object[k] === "function") continue;
					dst[k] = object[k];
				}
			});

			pipe.$fusion(res);
			pipe.$fifo();
		})

		// exec late options
		if(access.onOptionsLate) {
			pipe.$push(() => {
				access.onOptionsLate(pipe, binded)
			})
		}
	}

	/**
	 * Search items following the current role
	 *
	 * //Note: Here, params and body are merged together.//
	 * * driver.**cleanSearchCopy()**
	 * * schema.**onListEarly()**
	 * * driver.list()
	 * * driver.**cleanOutput()**
	 * * * field.**onFormat()**
	 * * schema.**onListLate()**
	 * @param  {keyonPipeline} pipe Related pipeline
	 * @param  {String} pipe.body.search Search string
	 * @param  {String} pipe.body.filters Search string
	 * @param  {String} pipe.body.sort Search string
	 */
	list(pipe) {
		const ctrl = this._controller;
		const access = this._access;
		const self = this;

		const binded = pipe.$fifo.bind(pipe);

		// clean input
		pipe.$push(() => {
			self._filters.cleanSearchCopy(pipe, binded);
		})

		// exec early create
		if(access.onCreateEarly) {
			pipe.$push(() => {
				access.onListEarly(pipe, binded)
			})
		}

		// create entry in database
		pipe.$push(() => {
			ctrl.driver.list(ctrl, pipe, binded);
		})

		// clean the output
		/*
		pipe.$push(() => {
			self.cleanOutput(pipe);
		})
*/

		// exec late create
		if(access.onCreateLate) {
			pipe.$push(() => {
				access.onListLate(pipe, binded)
			})
		}
	}

	/**
	 * Get an item following current role
	 *
	 * * driver.**cleanUUIDCopy()**
	 * * schema.**onGetEarly()**
	 * * driver.**get()**
	 * * driver.**cleanOutput()**
	 * * schema.**onGetLate()**
	 * @param  {keyonPipeline} pipe Related pipeline
	 * @param  {String} pipe.params.id UUID must be loaded
	 */
	get(pipe) {
		const ctrl = this._controller;
		const access = this._access;
		const self = this;

		// check availability
		if(this._access.available !== true || this._access.noget === true) {
			pipe.$error(403, "Resource not available");
			pipe.$end();
			return;
		}

		const binded = pipe.$fifo.bind(pipe);

		// clean UUID
		pipe.$push(() => {
			self._filters.cleanUUIDCopy(pipe, binded);
		})

		// exec early options
		if(access.onGetEarly) {
			pipe.$push(() => {
				access.onGetEarly(pipe, binded)
			})
		}

		// get data from database
		pipe.$push(() => {
			ctrl.driver.get(ctrl, pipe, binded);
		})

		// clean the output
		pipe.$push(() => {
			self._filters.cleanOutputCopy(pipe, binded);
		})

		// exec early options
		if(access.onGetLate) {
			pipe.$push(() => {
				access.onGetLate(pipe, binded)
			})
		}

	}

	/**
	 * Create an item following the current role
	 *
	 * * driver.**cleanInputCopy()**
	 * * schema.**onCreateEarly()**;
	 * * driver.**create()**
	 * * driver.**cleanOutput()**
	 * * schema.**onCreateLate()**
	 * @param  {keyonPipeline} pipe Related pipeline
	 * @param  {Object} pipe.body Body with the unsafe input awaited
	 */
	create(pipe) {
		const ctrl = this._controller;
		const access = this._access;
		const self = this;

		// check availability
		if(this._access.available !== true || this._access.nocreate === true) {
			pipe.$error(403, "Resource not available");
			pipe.$end();
			return;
		}

		const binded = pipe.$fifo.bind(pipe);

		// inform that the request an initial / create
		pipe.initial = true;

		// clean input
		pipe.$push(() => {
			self._filters.cleanInputCopy(pipe, binded);
		})

		// exec early create
		if(access.onCreateEarly) {
			pipe.$push(() => {
				access.onCreateEarly(pipe, binded)
			})
		}

		// create entry in database
		pipe.$push(() => {
			ctrl.driver.create(ctrl, pipe, binded);
		})

		// clean the output
		pipe.$push(() => {
			self._filters.cleanOutputCopy(pipe, binded);
		})

		// exec late create
		if(access.onCreateLate) {
			pipe.$push(() => {
				access.onCreateLate(pipe, binded)
			})
		}

	}

	/**
	 * Update an item following the current role
	 *
	 * @param  {keyonPipeline} pipe Related pipeline
	 * @param  {String} pipe.params.id UUID must be loaded
	 * @param  {Object} pipe.body Body with the unsafe input awaited
	 */
	update(pipe) {
		const ctrl = this._controller;
		const access = this._access;
		const self = this;

		const binded = pipe.$fifo.bind(pipe);

		// inform that the request update
		pipe.initial = false;

		// check availability
		if(this._access.available !== true || this._access.noupdate === true) {
			pipe.$error(403, "Resource not available");
			pipe.$end();
			return;
		}

		// clean input
		pipe.$push(() => {
			self._filters.cleanUUIDCopy(pipe, binded);
		})

		// clean input
		pipe.$push(() => {
			self._filters.cleanInputCopy(pipe, binded);
		})

		// exec early update
		if(access.onUpdateEarly) {
			pipe.$push(() => {
				access.onUpdateEarly(pipe, binded)
			})
		}

		// update entry in database
		pipe.$push(() => {
			ctrl.driver.update(ctrl, pipe, binded);
		})

		// clean the output
		pipe.$push(() => {
			self._filters.cleanOutputCopy(pipe, binded);
		})

		// exec late update
		if(access.onUpdateLate) {
			pipe.$push(() => {
				access.onUpdateLate(pipe, binded)
			})
		}
	}

	/**
	 * Delete an item following the current role
	 *
	 * * driver.**cleanUUIDCopy()**
	 * * schema.**onDeleteEarly()**
	 * * driver.**delete()**
	 * * schema.**onDeleteLate()**
	 * @param  {keyonPipeline} pipe Related pipeline
	 * @param  {String} pipe.params.id UUID must be loaded
	 */
	delete(pipe) {
		const ctrl = this._controller;
		const access = this._access;
		const self = this;

		// check availability
		if(this._access.available !== true || this._access.nodelete === true) {
			pipe.$error(403, "Resource not available");
			pipe.$end();
			return;
		}

		const binded = pipe.$fifo.bind(pipe);

		// clean input
		pipe.$push(() => {
			self._filters.cleanUUIDCopy(pipe, binded);
		})

		// exec early create
		if(access.onDeleteEarly) {
			pipe.$push(() => {
				access.onDeleteEarly(pipe, binded)
			})
		}

		// create entry in database
		pipe.$push(() => {
			ctrl.driver.delete(ctrl, pipe, binded);
		})

		// exec late create
		if(access.onDeleteLate) {
			pipe.$push(() => {
				access.onDeleteLate(pipe, binded)
			})
		}

	}

}

module.exports = keyonControllerRole;
