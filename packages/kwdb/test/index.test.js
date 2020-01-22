const requestTest = require('supertest');
const test = require('ava');
const memdb = require('level-mem');
const rocksdb = require('level-rocksdb');

const db = require('../index');

test.serial('default setting', async t => {
	const server = db.launch();
	const request = requestTest(server);
	const createBucketRes = await request
	.post('/buckets')
	.send(JSON.stringify({
		id: 'test'
	}));
	t.is(createBucketRes.body, 'OK');
	t.is(createBucketRes.status, 201);
	const createBuckerInitErrRes = await request
	.post('/buckets')
	.send(JSON.stringify({
		id: 'testInitErr',
		testInitErr: true
	}));
	t.is(createBuckerInitErrRes.status, 500);
	t.is(createBuckerInitErrRes.body, 'failed to init a new database');
	const createBuckerOpenErrRes = await request
	.post('/buckets')
	.send(JSON.stringify({
		id: 'testOpenErr',
		testOpenErr: true
	}));
	t.is(createBuckerOpenErrRes.status, 500);
	t.is(createBuckerOpenErrRes.body, 'failed to open the required database, please check if the database is already in use');
});
