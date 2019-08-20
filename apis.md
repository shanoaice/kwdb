# kwdb API Doc

## Web Router

* POST /bucket - Create new bucket
* POST /bucket/:id - Send data to the bucket ":id" in key:value format
* GET /bucket/:id - Get data from the bucket ":id"
* DELETE /bucket/:id - Delete a bucket with id ":id"
* DELETE /bucket/:id?key=:key - Delete a key named ":key" in the bucket ":id"
