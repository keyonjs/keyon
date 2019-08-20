const keyonDriverDB = require("./drivers/db");


class keyonDB {
	constructor(root) {
		this.root = root;

		// list of driver registered
		this.list = {};

		// polymorph driver
		this.poly = keyonDriverDB;

		// register mongodb driver
		this.register("./drivers/db/mongodb");
	}

	get(name) {
		return(this.list[name.toLowerCase()]);
	}

	register(file) {
		const o = require(file);
		const io = new o(this.root);
		this.list[io.getName().toLowerCase()] = io;
	}

	// activer un driver de données
	activate(name) {
		if(this.list[name]) return;
	}

	// vérifier si les drivers sont fonctionnels
	isAlive() {

	}
}

module.exports = keyonDB;
