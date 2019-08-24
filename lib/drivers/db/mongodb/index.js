const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const downTypes = Schema.Types;
const keyonDriverDB = require("../../db");
const iterator = require("../../../iterator");

const util = require('util')

class keyonDriverMongoDB extends keyonDriverDB {

	/**
	 * Construct mongodb data driver
	 * @param {keyon} root Main keyon context
	 */
	constructor(root) {
		super(root);

		/**
		 * Root context
		 * @type {keyon}
		 */
		this._root = root;

		/**
		 * Map of native types
		 * @type {Object}
		 */
		this._map = {};

		/**
		 * Is connection started ?
		 * @type {Boolean}
		 */
		this._started = false;

		/**
		 * Is connected to the server ,
		 * @type {Boolean}
		 */
		this.connected = false;

		const upTypes = root.lowTypes;
		const mapTypes = this._map;

		// official mongodb types support
		mapTypes[upTypes.Double] = downTypes.Decimal128;
		mapTypes[upTypes.String] = String;
		mapTypes[upTypes.Reference] = downTypes.ObjectId;
		mapTypes[upTypes.Id] = downTypes.ObjectId;
		mapTypes[upTypes.Boolean] = Boolean;
		mapTypes[upTypes.Date] = Date;
		mapTypes[upTypes.Regex] = RegExp;
		mapTypes[upTypes.Number] = Number;
		mapTypes[upTypes.Buffer] = Buffer;
		mapTypes[upTypes.Mixed] = downTypes.Mixed;

		root.configs.$fusion(
			"mongodb url",
			"mongodb://127.0.0.1:27017/keyon",
			"Database MongoDB URL connection"
		);

		root.configs.$fusion(
			"mongodb reconnectInterval",
			1000,
			"Reconnect every XXXXms"
		);

		root.configs.$fusion(
			"mongodb poolSize",
			20,
			"Maintain up to XX socket connections"
		);

		root.configs.$fusion(
			"mongodb connectTimeoutMS",
			3000,
			"Give up initial connection after XXms"
		);

		root.configs.$fusion(
			"mongodb socketTimeoutMS",
			45000,
			"Close sockets after 45 seconds of inactivity"
		);

	}

	/**
	 * Get the name of the current driver mainly used by {keyonDB}
	 *
	 * @return {String} Name of the driver
	 */
	getName() {
		return("MongoDB")
	}

	/**
	 * Connect to the mongodb server. This function return immediatly.
	 */
	connect() {
		if(this._started === true) return;

		const self = this;
		const conf = this._root.configs;
		const url = conf.$get("mongodb url");
		const options = {
			useNewUrlParser: true,
			reconnectInterval: conf.$get("mongodb reconnectInterval"),
			poolSize: conf.$get("mongodb poolSize"),
			connectTimeoutMS: conf.$get("mongodb connectTimeoutMS"),
			socketTimeoutMS: conf.$get("mongodb socketTimeoutMS"),
		}

		// connection
		function fireStarter() {
			console.log("Connecting to database "+url+'...');
			self.db = mongoose.createConnection(url, options, (error) => {
				console.log("Connection to database established");
				self.connected = true;
			});
			self.db.on('error', function(err) {
				self.connected = false;
				console.log("Connection lost with database "+options.url);
				console.log("Retrying in "+options.reconnectInterval);
				setTimeout(fireStarter, options.reconnectInterval);
			});
			//setSchemas();
		}

		// first connect
		fireStarter();

		this._started = true;

		// place stop event
		self._root.on("stop", () => {
			self.db.close();
		})
	}

	/**
	 * Schematic modeling function
	 *
	 * Cette méthode permet de modéliser le schéma dans la
	 * forme voulue pour communiquer avec la base de donnée.
	 * @param {keyonController} schema - Keyon Schema
	 * @override
	 */
	modelize(schema) {
		const self = this;

		// at this moment we need to be connect to mongodb.
		// At least connection instance must be created.
		this.connect();

		// late binding
		const ko = this._root;

		console.log("modelization of "+schema.name);

		// create mongodb schema
		var ret = iterator.assign(schema.fields, (user, dst, object, source) => {
			if(!object.$kind && !object.$kind.type) {
				console.log("No $kind / type defined for "+source);
			}
			else {
				// get the high type
				const rtype = ko.types[object.$kind.type];
				if(!rtype) {
					console.log("invalid type for "+source);
					process.exit(-1);
					return;
				}

				// run schema modeling on the field (pass #1)
				const modelingP1 = rtype.modeling(object);

				// transform native type to mongo types
				// here we are talking low type
				// (pass #2)
				var modelingP2 = iterator.assign(modelingP1, (user, dst, object, source) => {

					// lookup low type to native mongo type
					const ntype = self._map[object.$type];
					if(!ntype) {
						console.log("Can not map low type "+object.$type+" to native "+source);
						process.exit(-1);
					}

					dst.type = ntype;
				});

				// assign final schema field
				Object.assign(dst, modelingP2);
			}
		});

		// build mongodb dep schema
		schema.schema = new Schema(ret);

		// build mongodb dep model
		schema.model = this.db.model(
			schema.name,
			schema.schema
		);

		//console.log(util.inspect(ret, false, null, true));
	}

	/**
	 * Determine if the database is ready to accept requests
	 * @return {Boolean} return true if available
	 */
	isAlive() {

	}

	/**
	 * Adding a document in base
	 *
	 * @param {keyonController} controller Schema reference to use
	 * @param {keyonPipeline} pipe Pipeline reference
	 * @param {Object} pipe.body Input informations
	 */
	create(controller, pipe) {
		// apply constraints

		const doc = new controller.model(pipe.body);
		doc.save((err) => {
			if(err) {
				pipe.logs.message = error.message;
				pipe.$error(500, "Error saving document");
				pipe.$end();
				return;
			}

			pipe.$fusion(doc.toObject());
			pipe.$fifo();
		})
	}

	/**
	 * Updating a document in base
	 *
	 * @param {keyonController} controller Schema reference to use
	 * @param {keyonPipeline} pipe Pipeline reference
 	 * @param {Object} pipe.params Input informations paramétré
	 * @param {String} pipe.params.id Document ID
	 * @param {Object} pipe.body Updated Input informations
	 * @param {Object} pipe.constraints Primary request constraints (must not be accessible by end-user)
	 */
	update(controller, pipe) {
		// apply constraints

		controller.model.findOne({_id: pipe.params.id})
				.lean()
				.exec((err, data) => {
			if(!data) {
				pipe.$error(404, "Document not found")
				pipe.$end();
				return;
			}
			pipe.$fusion(data);
			controller.model.updateOne({_id: pipe.params.id}, {$set: pipe.body})
				.exec((err, doc) => {
					pipe.$fusion(pipe.body);
					pipe.$fifo();
			})
		})
	}

	/**
	 * Deleting a document in base
	 *
	 * @param {keyonController} controller Schema reference to use
	 * @param {keyonPipeline} pipe Pipeline reference
 	 * @param {Object} pipe.params Input informations paramétré
	 * @param {String} pipe.params.id Document ID
	 * @param {Object} pipe.constraints Primary request constraints (must not be accessible by end-user)
	 */
	delete(controller, pipe) {
		// apply constraints

		controller.model.findOne({_id: pipe.params.id})
				.exec((err, data) => {
			if(!data) {
				pipe.$error(404, "Document not found")
				pipe.$end();
				return;
			}
			data.remove(() => {
				pipe.$fifo();
			})
		})
	}

	/**
	 * Listing documents with constraints
	 *
	 * Will load pipe.list as return value
	 * @param {keyonController} controller Schema reference to use
	 * @param {keyonPipeline} pipe Pipeline reference
	 * @param {Object} pipe.body Contraint arguments
 	 * @param {String} [pipe.body.search] Search terms
	 * @param {Number} [pipe.body.skip=0] Documents skipped
	 * @param {Number} [pipe.body.limit=10] Limit of documents returned
	 * @param {String} [pipe.body.order] Document order comma separated with + and -
	 * @param {String} [pipe.body.populate] Document order comma separated with + and -
	 * @param {String} [pipe.body.filters] Add filters to request
	 * @param {Object} pipe.constraints Primary request constraints (must not be accessible by end-user)
	 * @example
	 * var body = {
	 * 	search: "Hey",
	 * 	skip: 10,
	 * 	limit: 50,
	 * 	order: "-createdAt -updatedAt",
	 * 	populate: "friends",
	 * 	filters: {
	 * 		accountId: "5ABC32..."
	 * 	}
 	 * }
	 */
	list(controller, pipe) {

		// apply constraints
		// filter
		// search
		// limit
		// skip
		controller.model.find()
				.lean()
				.exec((err, data) => {
			if(!data) {
				pipe.$fifo();
				return;
			}
			//console.log(data);
			//pipe.$fusion(data);
			pipe.$fifo();
		})

	}

	/**
	 * Get a document in base
	 *
	 * Will load pipe.document as return value
	 * @param {keyonController} controller Schema reference to use
	 * @param {keyonPipeline} pipe Pipeline reference
 	 * @param {Object} pipe.params Input informations paramétré
	 * @param {String} pipe.params.id Document ID
	 * @param {String} [pipe.params.populate] Document requested populate comma separated with + and -
	 * @param {Object} pipe.constraints Primary request constraints (must not be accessible by end-user)
	 */
	get(controller, pipe) {
		// apply constraints

		// get autoPopulate field

		if(!pipe.populate) pipe.populate = "";

		// get item
		controller.model.findOne({_id: pipe.params.id})
				.populate(pipe.populate)
				.lean()
				.exec((err, data) => {
			if(!data) {
				pipe.$error(404, "Document not found")
				pipe.$end();
				return;
			}
			pipe.$fusion(data);
			pipe.$fifo();
		})
	}

}

module.exports = keyonDriverMongoDB;
