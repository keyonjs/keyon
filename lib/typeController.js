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
}

module.exports = keyonTypeController;
