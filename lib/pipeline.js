/**
 * Keyon Pipeline
 */
class keyonPipeline {

	// source: name of the source emitter
	// end of the pipeline
	/**
	 * Construct a pipeline
	 * @param {String} source Source emitter
	 * @param {Function} end    Execute at the end of pipeline
	 */
	constructor(source, end) {
		/**
		 * Actual pipeline role
		 * @type {String}
		 */
		this.role = null;

		/**
		 * First level parameters, usually GET parameters
		 * @type {Object}
		 */
		this.params = {}

		/**
		 * Second level parameters, usually POST parameters
		 * @type {Object}
		 */
		this.body = {}

		/**
		 * Extended log parameters
		 * @type {Object}
		 */
		this.logs = {
			source: source
		}

		/**
		 * Final pipeline result
		 * @type {Object}
		 */
		this.result = {
			error: false,
			data: {}
		}

		/**
		 * Stack of execution
		 * @type {Array}
		 */
		this._flow = [];

		/**
		 * End of pipeline (one execution)
		 * @type {Function}
		 */
		this._end = end;
	}

	/**
	 * Push the stack of execution (save&restore equiv)
	 * @param  {Function} cb Callback to execute
	 */
	$push(cb) {
		this._flow.push(cb);
	}

	/**
	 * Run next operation in the pipe
	 */
	$lifo() {
		var cb = this._flow.pop();
		if(!cb) {
			if(this._end) this._end(this);
			return;
		}
		process.nextTick(cb, this)
	}

	/**
	 * Run prev operation in the pipe
	 */
	$fifo() {
		var cb = this._flow.shift();
		if(!cb) {
			if(this._end) this._end(this);
			return;
		}
		process.nextTick(cb, this)
	}


	/**
	 * Release immediate end-of-pipeline
	 */
	$end() {
		if(this._end) this._end(this);
		this._flow = []
		this._end = null;
	}

	/**
	 * [$error description]
	 * @param  {Number} code      HTTP Error code
	 * @param  {String} explained Description of the error
	 */
	$error(code, explained) {

		const res = this.result;
		res.error = true;
		res.code = code;
		res.message = explained;
		delete res.data;
	}

	/**
	 * Add an errored field
	 * @param  {String} id      Form transaction ID
	 * @param  {String} message Error message of the field
	 */
	$errorField(id, message) {

	}

	/**
	 * Fusionning reply data
	 * @param  {Object} data Data to merge
	 */
	$fusion(data) {
		const res = this.result;
		if(res.error === true) return;
		Object.assign(res.data, data);
	}

	/**
	 * Get the final pipeline result
	 * @return {Objet} Current pipeline result
	 */
	$result() {
		return(this.result)
	}
}

module.exports = keyonPipeline;
