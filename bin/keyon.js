#!/usr/bin/env node
"use strict";

const fs = require('fs');
const program = require('subcommander');
const debug = require('debug')('keyon:cli');
const path = require("path");


const url = require("url");
const iterator = require("../lib/iterator");
const express = require("express");
const http = require("http");


debug("Loading Keyon CLI Interface");

/*
// load specific commands
var source = __dirname+'/commands';
var dirs = fs.readdirSync(source);
for(var a in dirs) {
	var p = dirs[a];
	require(source+'/'+p);
}
*/

function usage(a) {
	if(a) return(process.argv[1]+" "+a+" --help");
	return(process.argv[1]+" --help");
}
// version command
program.command('version', {
	desc: 'Current version',
	callback: function () {
		const keyon = require("../index");
		console.log(' Keyon - v' + keyon.package.version + ' (c) 2019 - Michael Vergoz');
	},
});

program.command('serve', {
	desc: 'Serve Keyon Project',
	callback: function (options) {

		// sanatize directory
		var directory = options[0];
		if(!directory) {
			console.log("Missing directory\n");
			console.log("Please type \""+usage("serve")+"\" for more information");
			process.exit(-1);
		}

		// get target directory
		directory = path.resolve(process.cwd(), directory)

		// load keyon from local user directory
		var keyon;
		try {
			keyon = require(directory+"/node_modules/keyon/index");
		} catch(e) {
			console.log("Can not load Keyon from your project node_modules/");
			console.log("The project has been really started ?");
			console.log("Path: "+directory);
			process.exit(-1);
		}
		debug("Using local Keyon installation "+directory+" version "+keyon.package.version);

		// load user project bootstrapper
		try {
			require(directory+"/index");
		} catch(e) {
			console.log("Can not load you project");
			console.log("Path: "+directory+"/index.js");
			process.exit(-1);
		}

		const cli = {}

		// running initial task
		iterator.sync([
			// starting expressjs
			(next) => {
				cli.app = new express();
				cli.app.disable('x-powered-by');

				cli.router = new express.Router();

				cli.http = http.createServer(cli.app);

				cli.http.on("error", (err) => {
					console.log("HTTP Server Error on "+options.address+":"+options.port);
					console.log(err.message);
					process.exit(-1);
				})

				// populate key's response model
				cli.app.use((req, res, next) => {
					res.error = (code, messages, fields) => {
						var msg = messages;
						if(!(messages instanceof Array)) msg = [messages];

						res.status(code)

						const ret = {error: true, code: code};
						if(messages) ret.messages = messages;
						if(fields) ret.fields = fields;
						res.json(ret);
						return;
					}

					res.reply = (data, cache) => {
						var ret = {
							error: false,
							cache: cache || 0,
							expires: 0,
							data: data
						};

						if(cache) {
							const expires = new Date().getTime()+cache*1000;
							res.set({
								'Cache-Control': 'private; max-age='+cache,
								'Expires': new Date(expires).toGMTString()
							});
						}

						res.json(ret);
						return;
					}

					// parse url
					try {
						req.urlFull = url.parse(req.url);
					} catch(e) {
						res.error("400", "Bad URL requested");
						console.log("Bad URL encoding "+req.url+": "+e.message);
						return;
					};

					next();
				});

				next();
			},
			
			// register schemas etc...
			(next) => {
				// everything has been loaded
				keyon.$register(() => {
					debug("Keyon Registers completed");
					next();
				});
			},

			// bind express router
			(next) => {
				debug("ExpressJS router binding on "+options.baseurl);

				// late bind of routers
				cli.app.use(options.baseurl, cli.router)

				// garbaging rest of requests
				cli.app.use((req, res, next) => {
					res.error(404, "Not found")
				})
				next();
			},

			// bind application
			(next) => {
				if(cli.http) {
					cli.http.listen(options.port, options.address, 10, (err) => {
						debug("HTTP Server ready on "+options.address+":"+options.port);
						next();
					})
				}
				else {
					next();
				}
			}
		], () => {
			debug("Keyon Ready to use");
		})
	},
}).option('port', {
	abbr: 'p',
	desc: 'Set listening port',
	default: 10000
}).option('address', {
	abbr: 'a',
	desc: 'Set listening address',
	default: "127.0.0.1"
}).option('baseurl', {
	abbr: 'b',
	desc: 'Set base URI',
	default: "/"
})

program.parse();
