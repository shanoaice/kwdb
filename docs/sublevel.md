# Sublevel

> Added from: 1.5.0

> This function allows you to put all your data into different subdatabases without splitting them into different databases.

## Usage

Edit the config file([More about the config file](config)), add a property named `sublevel`, valid values of this property is listed below. 

### `sublevel`

Type: `boolean`|`string`  
Default `true`

If set to false then this function is disabled.

If set to true, then you are able to create sublevels inside a bucket.

If set to a string, then **kwdb** will create a base database and the string is its name. All of your buckets will become the sublevel namespace of this database. ***(Experimental)***

## RESTful APIs

The RESTful API added when `sublevel` sets to `true`:

* POST `/buckets/:id/sublevel`
  * REQUEST Body Spec:

    ```json
    {
        id: string //The id of the sublevel namespace
    }
    ```

  * RESPONSE Spec: The server will send a response, `2xx` code means operation success, otherwise(mainly `500`) it means an error occurred while creating or reopening the sublevel namespace.
