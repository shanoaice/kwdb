# kwdb WebAPI Document

kwdb is a server-side encapsulation for LevelDB, it provides a RESTful API through [express](https://github.com/expressjs/express)

## Web Interface

**You should add the host and port that you listens before this => `/`**

* POST `/buckets` Creates a new bucket, or reopen a exist bucket after the server had been restarted, or mount a exist bucket that had been unmounted to save memory usage.

  * REQUEST Body Spec:

    ```json
    {
        id: string //The id of the bucket
    }
    ```

  * RESPONSE Spec: The server will send a response, `2xx` code means operation success, otherwise(mainly `500`) it means an error occurred while creating or reopening the bucket such as try reopen a already-in-use bucket

* POST `/buckets/:id`  Creates a new `key:value` format data entry

  * REQUEST Body Spec:

    ``` json
    {
        key: string, //The key of this data entry
        value: any //The value of this data entry
    }
    ```

  * RESPONSE Spec: The response code `201` means successfully created a new data entry (**WATCH OUT!**) or updated a existed data entry. ***(NOTE: kwdb currently does not support `X-HTTP-Method-Override` request header, but LevelDB didn’t seperate create db entry and update db entry into two independent function so don’t worry about `X-HTTP-Method-Override: PUT` is not avaliable, but it will affect verb `DELETE`)***.

* POST `/buckets/:id/batch` A batch interface. JSON object is like `{tasks: taskArray}`, for more info about the taskArray please see [LevelDB Doc - db.batch()](https://github.com/Level/level#dbbatcharray-options-callback-array-form). The RESPONSE is similar to `POST /buckets`

* GET `/buckets` Get exist buckets in JSON array form

* GET `/buckets/umount/:id` Unmount the database :id to preserve memory usage, to open it again, use the interface `POST /buckets`

* GET `/buckets/:id` **Query String `key` required, syntax — `?key=`** Get a key (name specified in **Query String `key`**) in a bucket named :id

* DELETE `/buckets` Delete a bucket, requires same request body as GET `/buckets`, but the id property in the REQ body is the bucket that you want to delete. Response code `204` means successfully deleted bucket, otherwise the operation failed.

* DELETE `/buckets/:id` Delete a key in bucket `:id`, requires a REQUEST body that contains a `key` property that is the name of the key of the data entry you want to delete. Also, code `204` means operation success, otherwise it failed.
