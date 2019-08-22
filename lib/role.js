const iterator = require("./iterator");
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
class keyonRole {
	/**
	 * Construct a role
	 * @param {keyonController} controller [description]
	 * @param {String} name Name of the role
	 * @param {Object} access Object access
	 * @param {Object} fields Parametrable fields
	 */
	constructor(controller, name, access, fields) {
		this._controller = controller;
		this._name = name;
		this._access = access;
		this._fields = fields;
	}

	/**
	 * Clean UUID parameter
	 * @param  {keyonPipeline} pipe Related pipeline
	 */
	cleanUUIDCopy(pipe) {
		pipe.$fifo();
	}

	/**
	 * Clean output following the role
	 * @param  {keyonPipeline} pipe Related pipeline
	 */
	cleanOutput(pipe) {
		delete pipe.result.data.__v;
		pipe.$fifo();
	}

	/**
	 * Clean input body parameters
	 * @param  {keyonPipeline} pipe Related pipeline
	 */
	cleanInputCopy(pipe) {
		pipe.$fifo();
	}

	/**
	 * Return schema informations, used to drive UIs
	 *
	 * * schema.**onOptionsEarly()**
	 * * schema.**options()**
	 * * schema.**onOptionsLate()**
	 * @param  {keyonPipeline} pipe [description]
	 */
	options(pipe) {

		const access = this._access;
		const self = this;

		// check availability
		if(this._access.available !== true || this._access.nooptions === true) {
			pipe.$error(403, "Resource not available");
			pipe.$end();
			return;
		}

		// exec early options
		if(access.onOptionsEarly) {
			pipe.$push(() => {
				access.onOptionsEarly(pipe)
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
				access.onOptionsLate(pipe)
			})
		}
	}

	/**
	 * Search items following the current role
	 *
	 * //Note: Here, params and body are merged together.//
	 * @param  {keyonPipeline} pipe Related pipeline
	 * @param  {String} pipe.body.search Search string
	 * @param  {String} pipe.body.filters Search string
	 * @param  {String} pipe.body.sort Search string
	 */
	list(pipe) {

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

		// clean UUID
		pipe.$push(() => {
			self.cleanUUIDCopy(pipe);
		})

		// exec early options
		if(access.onGetEarly) {
			pipe.$push(() => {
				access.onGetEarly(pipe)
			})
		}

		// get data from database
		pipe.$push(() => {
			ctrl.driver.get(ctrl, pipe);
		})

		// clean the output
		pipe.$push(() => {
			self.cleanOutput(pipe);
		})

		// exec early options
		if(access.onGetLate) {
			pipe.$push(() => {
				access.onGetLate(pipe)
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

		// clean input
		pipe.$push(() => {
			self.cleanInputCopy(pipe);
		})

		// exec early create
		if(access.onCreateEarly) {
			pipe.$push(() => {
				access.onCreateEarly(pipe)
			})
		}

		// create entry in database
		pipe.$push(() => {
			ctrl.driver.create(ctrl, pipe);
		})

		// clean the output
		pipe.$push(() => {
			self.cleanOutput(pipe);
		})

		// exec late create
		if(access.onCreateLate) {
			pipe.$push(() => {
				access.onCreateLate(pipe)
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

		// check availability
		if(this._access.available !== true || this._access.noupdate === true) {
			pipe.$error(403, "Resource not available");
			pipe.$end();
			return;
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
		// check availability
		if(this._access.available !== true || this._access.nodelete === true) {
			pipe.$error(403, "Resource not available");
			pipe.$end();
			return;
		}

		// clean input
		pipe.$push(() => {
			self.cleanUUIDCopy(pipe);
		})

		// exec early create
		if(access.onDeleteEarly) {
			pipe.$push(() => {
				access.onDeleteEarly(pipe)
			})
		}

		// create entry in database
		pipe.$push(() => {
			ctrl.driver.delete(ctrl, pipe);
		})

		// exec late create
		if(access.onDeleteLate) {
			pipe.$push(() => {
				access.onDeleteLate(pipe)
			})
		}

	}

}

module.exports = keyonRole;
