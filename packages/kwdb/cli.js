#! /usr/bin/env node

const kwdb = require('.');
const yargs = require('yargs');
const fs = require('fs-extra');
const path = require('path');

const argv = yargs.usage('Usage: $0 --port|-p=[port] --host=[host] -c|--config=[config] --version -v|--verbose -d|--database=[databasePath] -h|--help')
	.option({
		'p': {
		alias: 'port',
		default: 8575,
		describe: 'The port that the kwdb server runs on',
		type: 'number'
		},
		'host': {
			default: '127.0.0.1',
			describe: 'The host that the kwdb server runs on'
		},
		'c':{
			alias: 'config',
			default: '.kwdbrc',
			describe: 'The path to the config file',
			type: 'string'
		},
		'h':{
			alias: 'help',
			describe: 'Show help'
		},
		'd':{
			alias: 'database',
			describe: 'The path of the database',
			default: './database',
			type: 'string'
		},
		'v':{
			alias: 'verbose',
			describe: 'Set the verbose level(depend on how many -v|--verbose flag did you add. E.g. -vv means level 2). Level 1 contains warning and level 2 contains debug message.'
		}
	})
	.count('verbose')
	.help()
	.version()
	.argv;

const VERBOSE_LEVEL = argv.verbose;

const LOG = (...arg) => { VERBOSE_LEVEL >= 0 && console.log(...arg); };
const WARN = (...arg) => { VERBOSE_LEVEL >= 1 && console.warn(...arg); };
const DEBUG = (...arg) => { VERBOSE_LEVEL >= 2 && console.log(...arg); };

DEBUG(argv);

let config;

if(argv.config && fs.existsSync(argv.config)) {
	fs.readJson(path.isAbsolute(argv.config)?argv.config:path.resolve(argv.config), {throws:false}, (err,obj) => {
		if(err) throw err;
		config = obj;
	});
}

DEBUG(config);

if(config) {
	if(!config.host) config.host = argv.host;

	if(!config.port) config.port = argv.port;

	if(!config.database) config.database = path.isAbsolute(argv.database)?argv.database:path.resolve(argv.database);
} else {
	config = {
		host: argv.host,
		port: argv.port,
		database: path.isAbsolute(argv.database)?argv.database:path.resolve(argv.database)
	};
}

DEBUG(config);

const exitHandle = (code) => {
	DEBUG(`Recieved signal: ${code}`);
	DEBUG('Starting cleanup');
	let successCount = 0, failCount = 0;
	for(const id in kwdb.buckets) {
		kwdb.buckets[id].close((e) => {
			if(e) { WARN(`Failed to close database ${id}`); failCount++;}
			DEBUG(`Successfully closed database ${id}`);
			successCount++;
		});
	}
	DEBUG(`Finished cleanup. Successfully closed ${successCount} database(s), failed on closing ${failCount} database(s). You may lost data if cleanup failed.`);
	DEBUG('Exiting...');
	if(typeof code !== 'number') process.exit(0);
};

process.on('SIGINT',exitHandle);

process.on('SIGTERM',exitHandle);

kwdb.log.on('log', msg => {
	LOG(msg);
});

kwdb.dbgMsg.on('error', msg => {
	console.error(msg);
});

kwdb.dbgMsg.on('debug', msg => {
	DEBUG(msg);
});

kwdb.dbgMsg.on('warn', msg => {
	WARN(msg);
})

kwdb.launch(config);
