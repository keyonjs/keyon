#!/usr/bin/env node
"use strict";

const fs = require('fs');
const program = require('subcommander');
const debug = require('debug')('keyon:cli');
const gatejs = require("../index");

console.log("Loading Keyon CLI Interface");

/*
// load specific commands
var source = __dirname+'/commands';
var dirs = fs.readdirSync(source);
for(var a in dirs) {
	var p = dirs[a];
	require(source+'/'+p);
}
*/

// version command
program.command('version', {
	desc: 'Current version',
	callback: function () {
		console.log(' Keyon - v' + gatejs.package.version + ' (c) 2019 - Michael Vergoz');
	},
});

program.parse();
