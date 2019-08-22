const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const koaBody = require('koa-body');
const Koa = require('koa');
const Router = require('koa-rapid-router');

exports.buckets = {};
exports.bucketIds = [];
exports.db = require('level');
exports.app = new Koa();
exports.router = new Router();
exports.dbgMsg = require('events').EventEmitter;
exports.name = 'kwdb';
exports.launch = ({ host = 'localhost', port = 8575, sublevel = true, database, doLog = true }) => {
	const { db, app, name, dbgMsg, router } = this;
	let { buckets, bucketIds } = this;
	app.use(koaBody());
	if (doLog) {
		// logger
		app.use(async (ctx, next) => {
			await next();
			const rt = ctx.response.get('X-Response-Time');
			console.log(`${ctx.method} ${ctx.url} - ${rt}`);
		});

		//X-Response-Time
		app.use(async (ctx, next) => {
			const start = Date.now();
			await next();
			const ms = Date.now() - start;
			ctx.set('X-Response-Time', `${ms}ms`);
		});
	}
	router.get('/',(req,res) => {
		res.status(200).send('OK');
	});
	router.get('/buckets',(req,res) => {
		res.status(200).json(bucketIds);
	});
	router.post('/buckets',(req,res) => {
		const { id } = req.body;
		db(path.join(database, id, '.db'),{},(err,db) => {
			if(err instanceof db.errors.OpenError) {
				dbgMsg.emit('err', err);
				res.status(500).send('failed to open the required database, please check if the database is already in use');
			} else if(err instanceof db.errors.InitializationError) {
				dbgMsg.emit('err', err);
				res.status(500).send('failed to init a new database, please check if your database id is valid(IF IT CONTAINS SPECIAL SYMBOLS)');
			} else {

				buckets[id] = db;
				bucketIds.push(id);
				res.status(200).send('OK');
			}
		});
	});
	router.delete('/buckets',(req,res) => {
		buckets[req.body.id].close(e => {
			if(e) {
				res.status(500).send(e);
			}
		});
		delete buckets[req.body.id];
		bucketIds = bucketIds.slice(bucketIds.indexOf(req.body.id),bucketIds.indexOf(req.body.id));
		fs.remove('database/' + req.body.id + '.db', err => {
			if(err) throw res.status(500).send(err);
			else res.status(204).send('OK');
		});
	});
	router.get('/buckets/umount/:id', (req,res) => {
		const body = req.params;
		try {
			buckets[body.id].close(e => {
				if(e) {
					res.status(500).send('unable to close database' + body.id + ', please check if this database is already closed');
				} else res.status(200).send('OK');
			});
		} catch (e) {
			res.status(500).send(e.message);
		}
	});
	router.post('/buckets/:id', (req,res) => {
		var body = req.body;
		var id = req.params.id;
		try {
			buckets[id].put(body.key,body.value,e => {
				if(e) res.status(500).send(e); else res.status(201).send('OK');
			});
		} catch (e) {
			res.status(500).send(e.message);
		}
	});
	router.get('/buckets/:id', (req,res) => {
		const id = req.params.id;
		const query = req.query;
		try {
			buckets[id].get(query.key,(err,val) => {
				if(err) {
					if(err.notFound) {
						res.status(404).send('You are trying to fetch a key that does not exist in this bucket');
					} else res.status(500).send(err);
				}
				res.type('json');
				res.status(200).send(val);
			});
		} catch (e) {
			res.status(500).send(e.message);
		}
	});
	router.delete('/buckets/:id',(req,res) => {
		const id = req.params.id;
		const key = req.body.key;
		buckets[id].del(key,e => {
			if(e) {
				res.status(500).send(e);
			} else res.status(204).send('Content deleted');
		});
	});
	router.post('/buckets/:id/batch',(req,res) => {
		const id = req.params.id;
		const tasks = req.body.task;
		buckets[id].batch(tasks,(e) => {
			res.status(500).send(e);
		});
	});
	app.use(router.Koa());
	app.listen(port, host, () => {
		console.log(`App ${name} listening at port ${port}, host ${host}`);
	});
};
