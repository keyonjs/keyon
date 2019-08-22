/**
 * Keyon Type abstraction
 * @abstract
 */
class keyonTypeController {
	/**
	 * Return driver type name
	 * @return {String} Type name
	 */
	getName() { return 'None' }

	/**
	 * Schemas low types modeling
	 * @param  {Object} object Object to follow
	 * @return {Object}        Modeled schema
	 * @abstract
	 */
	modeling(object) {

	}

	/**
	 * Handling high type from server side
	 *
	 * Assign a result
	 * ```js
	 * dst[key] = input;
	 * ```
	 * @param  {keyonPipeline}   pipe  Related pipeline
	 * @param  {Object}          dst   The destination object
	 * @param  {String}          key   Current key
	 * @param  {Object}          field Related schema field
	 * @param  {Mixed}           input Unsafe data from users
	 * @param  {String}          track Tracking field ID
	 * @param  {Function}        done  When processing handler done
	 */
	handler(pipe, dst, key, field, input, track, done) {
		console.log("Abtract input handler");
		done();
	}
}

module.exports = keyonTypeController;
