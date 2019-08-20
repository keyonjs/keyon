/**
 * Configuration manager
 */
class keyonConfigs {
	/**
	 * Create configuration context
	 * @param {keyon} root Keyon context
	 */
	constructor(root) {
		/**
		 * Keyon context
		 * @type {keyon}
		 */
		this._root = root;
	}

	/**
	 * Fusion declaration of a new configuration variable
	 * @param  {String} conf Configuration key name
	 * @param  {Mixed}  dft  Default value
	 * @param  {String} doc  Related documentation
	 */
	$fusion(conf, dft, doc) {
		const self = this;

		function subFusion(conf, dft, doc) {
			if(self[conf]) return;
			self[conf] = {default: dft, doc: doc}
		}

		if(Array.isArray(conf)) {
			for(var a in conf) subFusion(conf[0], conf[1], conf[2])
		}
		else {
			subFusion(conf, dft, doc)
		}
	}

	/**
	 * Set configuration value
	 * @param {String} key   Configuration key name
	 * @param {Mixed}  value Value to set
	 */
	$set(key, value) {
		const self = this;

		function subSet(key, value) {
			if(!self[key]) return;
			self[key].value = value;
		}

		if(typeof key === "object") {
			for(var k in key) subSet(k, key[k]);
		}
		else {
			subSet(key, value);
		}
	}

	/**
	 * Get value
	 * @param  {String} key Configuration key name
	 * @return {Mixed}      The value
	 */
	$get(key) {
		if(!this[key]) return(null);
		const ptr = this[key];
		return(ptr.value||ptr.default);
	}
}

module.exports = keyonConfigs;
