const EventEmitter = require("events").EventEmitter;
const keyonDB = require("./lib/db.js");
const keyonSchemas = require("./lib/schemas.js");
const keyonTypes = require("./lib/types.js");
const keyonConfigs = require("./lib/configs.js");
const keyonPlugins = require("./lib/plugins.js");
const keyonPipeline = require("./lib/pipeline.js");
const iterator = require("./lib/iterator");
const pkg = require("./package.json");

/*
UPKEY
	$ROUTER > Router racine express.js
	$SCHEMAS > Définition des schémas controllé
		$MODEL > Modèle interne mongodb
		$ROUTER > Routeur API
		$INITIAL > Modèle initial du schéma
		$ROLES[] > Schémas initiaux au format du role attendu (compilé)
*/

/**
 * Main Keyon Process Class
 */
class keyon extends EventEmitter {
	constructor() {
		super()

		this.$state = {
			api: false,
			cli: false,
			react: false,
			admin: false,
			library: false
		}

		this.configs = new keyonConfigs(this);
		this.types = new keyonTypes(this);
		this.db = new keyonDB(this);
		this.schemas = new keyonSchemas(this);
		this.plugins = new keyonPlugins(this);
		this.pipeline = keyonPipeline;

		this.package = pkg;

		/**
		 * Referenced roles
		 * @type {Object}
		 */
		this._roles = {}

		// place public role configuration
		this.configs.$fusion(
			"public role",
			"public",
			"Select default public role name"
		);
		this.configs.$fusion(
			"admin role",
			"admin",
			"Select default admin role name"
		);
		this.configs.$fusion(
			"name",
			"Default",
			"Site name"
		);
		this.configs.$fusion(
			"brand",
			"Default",
			"Brand name"
		);
	}

	$init(config) {
		this.configs.$set(config);
	}

	/**
	 * Stop Keyon services as started
	 */
	$stop() {
		this.emit("stop", this);
	}

	$use(hooker) {

	}

	/**
	 * Create a new role into the application
	 * @param  {String} name        Name of the role
	 * @param  {String} description Explained role
	 */
	$role(name, description) {
		this._roles[name] = {
			name: name,
			description: description
		}
	}

	/**
	 * Register the really root of the keyon kernel
	 *
	 * Here schemas will be ready to use directly or indirectly using libraries.
	 * At this stage APIs are not published.
	 * @param  {Function} cb End callback
	 */
	$register(cb) {
		// already registered
		if(this._registered === true) {
			return;
		}

		// register public role
		this.$role(this.configs.$get("public role"), "Default public role")
		this.$role(this.configs.$get("admin role"), "Default admin role")

		const self = this;

		const list = [
			(next) => {
				self.schemas._prepare(() => {
					console.log("Schemas loaded and ready to use");
					next();
				});
			}
		]

		iterator.sync(list, () => {
			self._registered = true;
			if(cb) cb();
		})
	}


	$flowAPI(app) {
		const express = require("express");
		const bodyParser = require('body-parser');

		// initialize main router
		this.router = new express.Router;

		// parepare router
		// parse body, urlencoded support, json
		this.router.use(bodyParser.json({
			extended: true
		}));
		this.router.use(bodyParser.urlencoded({
			extended: true
		}));

		// plug the main router into express core
		app.use(this.router);
	}


	$flowCLI() {

	}


	/**
	 * This method compile every React component together
	 * and run react using webpack. The destination path contains
	 * the full compiled version of all components
	 * @param {Object} options - React generator options
     * @param {path} [options.destination] - Generate React Gathering
     * @param {express} [options.app] - Distribute React Gathering using expressjs
	 * @param {string} [options.appPath] - Distribute React Gathering using expressjs
     */
	$flowReact(options) {


		// distribute react gathering
		const appPath = options.appPath || '/ko.js';
		if(options.app) {
			options.app.get(appPath, (req, res) => {
				res.json({thank: "ok"})
			})
		}
	}

	/**
	 * Generate administration UI
	 * This method compile web administration component together
	 * and run react using webpack.
	 * @param {Object} options - AdminUI generator options
	  * @param {path} [options.destination] - Generate AdminUI
	  * @param {express} [options.app] - Distribute AdminUI using expressjs
	 * @param {string} [options.appPath] - Distribute AdminUI using expressjs
	 */
	$flowAdminUI(options) {

	}

	/**
	 * Cette fonction permet d'initialiser l'intégralité des fonctions d'accès
	 * bas niveau des API
	 * @param {Function} cb Determine when library is loaded
	 */
	$flowLibrary(cb) {

	}

	flowAPILib() {

	}


}

module.exports = new keyon();


// ----------------------------------------------------
/*

const ko  = module.exports;
const Types = ko.types;

ko.$init({
	'name': 'My Site',
	'brand': 'My Site',

	'base path': '/',

	'less': 'public',
	'static': 'public',
	'favicon': 'public/favicon.ico',
	'views': 'templates/views',
	'view engine': 'pug',

	'auto update': true,
	'session': true,
	'auth': true,
	'user model': 'User'
})

// create an admin role
ko.$role("admin", "Administative admin");

ko.schemas.$fusion('accounts', {
	name: {
		$label: "Text",
		$kind: {
			type: "Text",
			index: true,
		},
	},
	email: {
		$kind: {
			type: "Text",
		},
	},
	address: {
		street: {
			$kind: {
				type: "Text",
			},
		},
		zip: {
			$kind: {
				type: "Text",
			},
		},
	},
	isAdmin: {
		$kind: {
			type: "Text",
		},

		$roles: {
			admin: {
				$sort: true,
				$nocreate: false,
				$noupdate: false,
				$hidden: false,
			}
		},

		$sort: false,
		$nocreate: true,
		$noupdate: true,
		$hidden: true,
	},
})

ko.schemas.$access('accounts', {
	$roles: {
		admin: {
			available: true,
			noupdate: false,
			nocreate: false,
			nodelete: false,
			nolist: false,
			noget: false,
		}
	},
	available: false,

	noupdate: true,
	nocreate: true,
	nodelete: true,
	nolist: true,
	noget: true,
})

*/
