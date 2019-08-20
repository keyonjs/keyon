const keyonController = require("./controller");

/**
 * Schemas management
 */
class keyonControllers {
	constructor(root) {
		this._root = root;

		/** Original fusionned schemas */
		this.$org = {}
	}

	/**
	 * get or create node schema
	 */
	_node(schema) {
		if(!this.$org[schema]) {
			this.$org[schema] = new keyonController(this._root, schema)

			// make a shortcut
			this[schema] = this.$org[schema];
		}
		return(this.$org[schema])
	}

	/**
	 * Prepare schemas to be used
	 */
	_prepare(cb) {
		for(var a in this.$org) this.$org[a]._prepare();
		if(cb) cb();
	}

	$access(schema, options) {
		const ptr = this._node(schema);
		ptr.$access(options);
	}

	$fusion(schema, fields, driver) {
		const ptr = this._node(schema);
		ptr.$fusion(fields);
	}

	/**
	 * Manage an index for the schema
	 * @param {String} schema Name of the schema
	 * @param {Object} group Groupe of index
	 * @example
	 * keyon.$schemas.$index("example", { name: 1, type: -1 });
	 */
	$index(schema, group) {
		const ptr = this._node(schema);
		ptr.$index(group);
	}


	$use(schema) {

	}


}

module.exports = keyonControllers;
