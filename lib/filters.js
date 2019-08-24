const iterator = require("./iterator");

/**
 * Pipelined filters
 *
 * Filters use pipelines to produce the results
 * But above all it is possible for filters to
 * generate errors, logs [...] through pipelines.
 */
class keyonFilters {
	constructor(name, fields) {
		const self = this;

		this._name = name;
		this._fields = fields;

		// build dotted search
		this.dottedSearch = {}
		this.dottedSort = {}
		this.dottedFilter = {}

		iterator.assign(this._fields, (user, key, field, rail) => {
			if(field.$filter === true) {
				self.dottedFilter[rail] = true;
			}

			if(field.$sort === true) {
				self.dottedSort[rail] = true;
			}

			if(field.$search === true) {
				self.dottedSearch[rail] = true;
			}
		})
	}

	/**
	 * Clean input body parameters
	 * @param  {keyonPipeline} pipe Related pipeline
	 * @param  {Function} end End callback
	 */
	cleanInputCopy(pipe, end) {
		var ret = {};
		iterator.dualpipe(pipe, ret, this._fields, pipe.body, (dst, key, field, input, done) => {
			// get type handler
			const type = field.$kind._hdl;

			// the field can not be updated
			if(pipe.initial !== true && field.$noupdate === true) {
				done();
				return;
			}

			// execute type handler
			if(type.handler) type.handler(pipe, dst, key, field, input, null, done);
			else {
				dst[key] = input;
				done();
			}
		}, null, () => {
			pipe.body = ret;
			end();
		})
	}

	/**
	 * Clean output following the role
	 * @param  {keyonPipeline} pipe Related pipeline
	 * @param  {Function} end End callback
	 */
	cleanOutputCopy(pipe, end) {
		// copy the state of result
		pipe.rawResult = Object.assign({}, pipe.result)

		// should support array
		var ret = {
			id: pipe.result.data._id
		};

		iterator.dualpipe(pipe, ret, this._fields, pipe.result.data, (dst, key, field, input, done) => {
			// get type handler
			const type = field.$kind._hdl;

			// the field is hidden or
			if(field.$hidden === true) {
				done();
				return;
			}

			// execute type handler
			if(type.output) type.output(pipe, dst, key, field, input, null, done);
			else {
				dst[key] = input;
				done();
			}
		}, null, () => {
			pipe.result.data = ret;
			end();
		})
	}

	/**
	 * Clean UUID parameter
	 * @param  {keyonPipeline} pipe Related pipeline
	 * @param  {Function} end End callback
	 */
	cleanUUIDCopy(pipe, end) {
		if(end) end();
	}

	/**
	 * Clean input list
	 * @param  {keyonPipeline} pipe Related pipeline
	 * @param  {Function} end End callback
	 */
	cleanSearchCopy(pipe, end) {
		end();
		return;


	}
}

module.exports = keyonFilters;
