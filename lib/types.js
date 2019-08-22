const keyonTypeController = require("./typeController");

/**
 * Official Low Types
 * @type {Object}
 */
const lowTypes = {
	"Double": 1,
	"String": 2,
	"Reference": 3,
	"Id": 4,
	"Boolean": 5,
	"Date": 6,
	"Regex": 7,
	"Number": 8,
	"Buffer": 9,
	"Mixed": 10
}


class Name extends keyonTypeController {
	getName() { return 'Name' }


	modeling(object) {
		const kind = object.$kind;

		return({
			first: {
				$type: lowTypes.String
			},
			last: {
				$type: lowTypes.String
			}
		})
	}
}

class Text extends keyonTypeController {
	getName() { return 'Text' }


	handler(pipe, dst, key, field, input, track, done) {
		dst[key] = input;
		//console.log("Text input handler ", input);

		done();
	}


	modeling(object) {
		return({
			$type: lowTypes.String,
		})
	}
}


class Virtual extends keyonTypeController {
	getName() { return 'Virtual' }


	handler(pipe, dst, key, field, input, track, done) {
		dst[key] = input;
		console.log("Virtual input handler ", input);

		done();
	}


	modeling(object) {
		return({
			$type: lowTypes.String,
		})
	}
}

class JSON extends keyonTypeController {
	getName() { return 'JSON' }


	modeling(object) {
		return({
			$type: lowTypes.Mixed,
		})
	}
}

/**
 * Keyon Types Manager
 */
class keyonTypes {
	constructor(root) {
		/**
		 * Keyon context
		 * @type {keyon}
		 */
		this._root = root;

		root.lowTypes = lowTypes;

		/**
		 * Use to create a new type, object must be abstract
		 * @type {keyonTypeController}
		 */
		this.$abstract = keyonTypeController;

		this.$register(new Name);
		this.$register(new Text);
		this.$register(new JSON);
	}

	/**
	 * Direct type register (without file)
	 * @param  {keyonTypeController} object keyonTypeController polymorph
	 */
	$register(object) {
		const p = object;
		object = object.getName()
		/**
		 * Register the object into the object as methods
		 * @type {String}
		 */
		this[object] = p;
	}

	/**
	 * File type registration
	 * @param  {String} file Filename
	 */
	$file(file) {
		var o;
		try {
			o = require(file);
		} catch(e) {
			console.log(e);
			return;
		}
		this.$register(new o)
	}



}

module.exports = keyonTypes;
