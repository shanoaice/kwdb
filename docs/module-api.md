# kwdb Module API

Install kwdb locally: `npm i kwdb`

Import kwdb as db: `const db = require('kwdb');`

* `db.buckets` `Object` An object that store mounted(Opened) database instances
* `db.bucketIds` `Array` An array that store the ids of the mounted database instances
* `db.app` An instance of HTTP module [express](https://github.com/expressjs/express)
* `db.db` An instance of [level](https://github.com/Level/level) module, you can replace it with databases that expose the same API as LevelDB like [level-rocksdb](https://github.com/Level/level-rocksdb) or LevelUP+MemDOWN to make a Redis-like service
* `db.name` `string` The name of this app, default is `'kwdb'`
* `db.launch(host,port)` A method to launch the kwdb APP. Parameter `host` is the hostname that you want to listen, default is `localhost`, or if you set a environment variable named `kwdb_HOST` and you passed a falsy `host` parameter it will use this. Parameter `port` is almost the same, but is the port you want to listen, default is `8575` and use the env var `kwdb_PORT`

