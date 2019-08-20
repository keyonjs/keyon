const keyonPipeline = require("./pipeline");
const merge = require("deepmerge");

const overwriteMerge = (destinationArray, sourceArray, options) => {
	if(typeof destinationArray[0] == "string" || typeof sourceArray[0] == "string") {
		return(merge(destinationArray, sourceArray))
	}
	if(!destinationArray[0]) destinationArray[0] = {}
	if(!sourceArray[0]) sourceArray[0] = {};
	return([merge(destinationArray[0], sourceArray[0])])
}

const leafRegex = /^\$/;

/**
 * KeyStone of Keyon
 */
class keyonIterator {
	/**
	 * Determine if there a defined fields in the current object stage
	 * @param  {Object}  from Current stage
	 * @return {Boolean}      true there is reference, false it's free
	 */
	isThereSubObject(from) {
		for(var key in from) {
			var value = from[key];
			if(!leafRegex.test(key)) {
				return(true);
			}
		}
		return(false);
	}

	/**
	 * Determine if there an object parameter
	 * @param  {Object}  from Current stage
	 * @return {Boolean}      true there is reference, false it's free
	 */
	isThereObjectParams(from) {
		for(var key in from) {
			var value = from[key];
			if(leafRegex.test(key)) {
				return(true);
			}
		}
		return(false);
	}

	/**
	 * Generator deep iterator is a complex function to assign a
	 * new struture of a current schema
	 * @param  {Object} from Source schema to follow
	 * @param  {Function} leaf Executed on each leaf
	 * @param  {Mixed} user    User pointer
	 * @param  {lkey} lkey Internal use
	 */
	assign(from, leaf, user, lkey) {
		var ret = {};

		// if there is object parameters send leaf immediatly
		if(this.isThereObjectParams(from)) {
			leaf(user, ret, from, lkey);
		}

		// follow the rest of keys
		for(var key in from) {
			var value = from[key];
			if(!leafRegex.test(key)) {
				const save = lkey;
				lkey = lkey ? lkey+"."+key:key;
				if(Array.isArray(value)) {
					ret[key] = [this.assign(value[0], leaf, user, lkey)];
				}
				else {
					ret[key] = this.assign(value, leaf, user, lkey);

				}

				// prune the branch
				if(Object.keys(ret[key]) == 0) delete ret[key];

				// restore state
				lkey = save;
			}
		}

		return(ret);
	}

	/**
	 * Fusionning 2 objects schema, returning new one
	 * @param  {Object} dst Destination object
	 * @param  {Object} src Source object
	 * @return {Object}     New object
	 */
	fusion(dst, src) {
		return(merge(
			dst,
			src,
			{ arrayMerge: overwriteMerge }
		));
	}
}



module.exports = new keyonIterator
