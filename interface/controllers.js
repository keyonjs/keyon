const keyonController = require("../lib/controller");
const iterator = require("../lib/iterator");
const debug = require("debug")("keyon:interface:controllers");


/**
 * Controller interface management
 *
 * Generic object allowing to regroup all schemas controllers in the same place.
 * It looks like a schemas router.
 */
class keyonInterfaceControllers {
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
			debug("Registering controller "+schema);
			//this.$org[schema] = new keyonController(this._root, schema)

			// make a shortcut
			this[schema] = this.$org[schema];
		}
		return(this.$org[schema])
	}

	/**
	 * Prepare schemas to be used
	 */
	_prepare(cb) {
		debug("Prepare schemas...");
		const list = []

		for(let a in this.$org) {
			list.push((next) => {
				debug("Preparing schema "+a);
				this.$org[a]._prepare(next);
			})
		}

		iterator.sync(list, () => {
			debug("Schemas ready");
			if(cb) cb();
		})
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

module.exports = keyonInterfaceControllers;
