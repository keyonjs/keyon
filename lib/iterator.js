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

const internal = {
	$required: true,
	$maxArray: 100
}

/**
 *  Keyon Iterators utilities
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
			if(internal.hasOwnProperty(key)) continue;
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
			if(internal.hasOwnProperty(key)) continue;
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
			return(ret);
		}

		// follow the rest of keys
		for(var key in from) {
			var value = from[key];
			if(!leafRegex.test(key)) {
				const save = lkey;
				lkey = lkey ? lkey+"."+key:key;
				if(Array.isArray(value)) {
					ret[key] = [this.assign(value[0], leaf, user, lkey)];

					// prune branch
					if(Object.keys(ret[key][0]) == 0) delete ret[key];
				}
				else {
					ret[key] = this.assign(value, leaf, user, lkey);

					// prune the branch
					if(Object.keys(ret[key]) == 0) delete ret[key];
				}

				// restore state
				lkey = save;
			}
		}

		return(ret);
	}

	/**
	 * Dual Pipeline Iterator
	 *
	 * This iterating method allow to compare a schema and an input
	 * data. It implements the pipeline to allow errors generation
	 * mainly from typing error.
	 * @param  {keyonPipeline} pipe   [description]
	 * @param  {Object} ret    Return reference
	 * @param  {Object} schema Schema object
	 * @param  {[type]} input  Unsafe input data
	 * @param  {[type]} leaf   Leaf executor
	 * @param  {[type]} lkey   Linear key (internal)
	 * @param  {Function} end   End callback (internal) or pipe.$fifo()
	 */
	dualpipe(pipe, ret, schema, input, leaf, lkey, end) {
		const self = this;

		this.eachObject(schema, (key, value, next, oend) => {
			if(oend === true) {
				if(end) end();
				else pipe.$fifo()
				return;
			}

			if(!leafRegex.test(key)) {
				const user = input[key];
				const save = lkey;

				// construct linear key
				lkey = lkey ? lkey+"."+key:key;

				// schema awaiting array
				if(Array.isArray(value)) {
					value = value[0];

					// is array required ?
					if(pipe.initial === true && !user && value.$required === true) {
						pipe.$error(400, lkey+" is a required array");
						pipe.$end();
						return;
					}

					// check if there is an input
					if(!user) {
						lkey = save;
						next();
						return;
					}

					// check if input is an array
					if(user && !Array.isArray(user)) {
						pipe.$error(400, "Invalid Type Array in "+lkey);
						pipe.$end();
						return;
					}

					const maxIndex = value.$maxArray || internal.$maxArray;

					// determine si le schema fait un access direct ou
					// passe par des champs
					if(this.isThereObjectParams(value)) {
						//console.log("pour "+lkey+" array à acces direct");
						ret[key] = []

						// follow user items
						self.eachItem(user, (index, ivalue, nextItem, end) => {
							if(end === true) {
								// prune
								if(ret[key].length == 0) delete ret[key];

								// restore lkey
								lkey = save;

								// next item
								next();

								return;
							}

							// evaluate maximum array index
							if(index >= maxIndex) {
								pipe.$error(400, "Maximum array limit reach for "+lkey);
								pipe.$end();
								return;
							}

							// assign result
							var iret = {} // fake return
							leaf(iret, key, value, ivalue, () => {
								const p = iret[key];
								if(p !== undefined) ret[key].push(p);
								nextItem();
							});
						})

					}
					else {
						//console.log("pour "+lkey+" array à acces indirect");
						ret[key] = []

						// follow user items
						self.eachItem(user, (index, ivalue, nextItem, end) => {
							if(end === true) {
								// prune
								if(ret[key].length == 0) delete ret[key];

								// restore lkey
								lkey = save;

								// next item
								next();

								return;
							}

							// evaluate maximum array index
							if(index >= maxIndex) {
								pipe.$error(400, "Maximum array limit reach for "+lkey);
								pipe.$end();
								return;
							}

							// assign result
							var iret = {} // fake return
							self.dualpipe(pipe, iret, value, ivalue, leaf, lkey, () => {
								if(Object.keys(iret).length > 0) ret[key].push(iret);
								nextItem();
							})
						})
					}
				}
				else {
					// is array required ?
					if(pipe.initial === true && !user && value.$required === true) {
						pipe.$error(400, lkey+" is a required value");
						pipe.$end();
						return;
					}

					// check if there is an input
					if(!user) {
						lkey = save;
						next();
						return;
					}

					// determine si le schema fait un access direct ou
					// passe par des champs
					if(this.isThereObjectParams(value)) {
						//console.log("pour "+lkey+" champs à acces direct", value);
						leaf(ret, key, value, user, () => {
							// restore lkey
							lkey = save;

							// next item
							next();
						});
					}
					else {
						//console.log("pour "+lkey+" champs à acces indirect");

						ret[key] = {}
						self.dualpipe(pipe, ret[key], schema[key], input[key], leaf, lkey, () => {
							// prune
							if(Object.keys(ret[key]).length == 0) delete ret[key];

							// restore lkey
							lkey = save;

							// next item
							next();
						})
					}
				}

				return;
			}

			next();
		})
	}

	/**
	 * Async object follower
	 * @param  {[type]} objs       Object to follow
	 * @param  {Function} executor Per item execution
	 */
	eachObject(objs, executor) {
		var aObjects = [];

		// transpose objets to array
		for(var a in objs)
			aObjects.push([a, objs[a]]);

		function next() {
			var o = aObjects.shift();
			if(!o) {
				executor(null, null, next, true)
				return;
			}
			executor(o[0], o[1], next, false)
		}

		process.nextTick(next);
	}

	/**
	 * Async array follower
	 * @param  {[type]} list     List of object
	 * @param  {[type]} executor Per item execution
	 */
	eachItem(list, executor) {
		var index = 0;
		if(!Array.isArray(list))
			return(executor(null, null, null, true))
		function next() {
			var o = list[index];
			if(!o) {
				executor(null, null, null, true)
				return;
			}
			index++;
			executor(index, o, next, false)
		}
		process.nextTick(next);
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
