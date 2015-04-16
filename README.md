# access-mongo

Simple MongoDB wrapper. Will present a consistent promised API for both MongoDB and NEDB databases.

This will be incredibly useful for testing using local files rather than actual MongoDB instances. This will also be very useful for using a MongoDB-like database for work that can use simple flat files. In this case your fixtures can just be the NEDB files, which are an extended form of JSON.

## Installation
```
npm install --save access-mongo
```

## Usage

```javascript
var AccessMongo = require('access-mongo');

AccessMongo.connect('mongodb://foo:bar@hello.com:1234/mydb').then(function() {
  // create a model for collection users
  var User = AccessMongo.createModel('users');
  
  User.where({name: 'Matt'}).then(function(user) {
    console.log(user);
  });
});

// connect to multiple databases
AccessMongo.connect({
  foo: 'mongodb://foo:bar@hello.com:1234/mydb',
  bar: 'mongodb://foo:bar@yoyo.foo.bar:1234/otherdb'
}).then(function() {
  var FooUser = AccessMongo.createModel('users', {connection: 'foo'});
  var BarUser = AccessMongo.createModel('users', {connection: 'foo'});
});

// override query parameters of all connections
AccessMongo.connect({
  foo: 'mongodb://foo:bar@hello.com:1234/mydb',
  bar: 'mongodb://foo:bar@yoyo.foo.bar:1234/otherdb'
}, {
  maxPoolSize: 3
});

// create an nedb database
AccessMongo.connect('test.db').then(function() {
  var User = AccessMongo.createModel('users');
  
  User.where({name: 'Matt'}).then(function(user) {
    console.log(user);
  });
});

```

## Primary API

### AccessMongo

`AccessMongo` is a singleton that manages the connection state to each database you connect to. You can connect to one or multiple databases. Each connection has a name that you can use to refer to it later. If you don't specify a name the connection name will be `default`.

#### Connecting to a single database

Returns a promise that resolves to the instance of `AccessMongo`.

```javascript
AccessMongo.connect('mongodb://localhost:27017/test-db');
```

#### Connecting to a multiple databases

Returns a promise that resolves to the instance of `AccessMongo`.

```javascript
AccessMongo.connect({
  default: 'mongodb://localhost:27017/test-db',
  foo: 'mongodb://foo:bar@other.db.com:27019/some-db'
});
```

#### Disconnecting from all databases

Returns a promise that resolves to the instance of `AccessMongo`.

```javascript
AccessMongo.disconnect();
```

#### Creating a model

Returns a `Model` object.

```javascript
// create a model stored in the 'users' collection
var User = AccessMongo.createModel('users');

// create a model stored in the 'users' collection, 'foo' connection, default database
var User = AccessMongo.createModel('users', {connection: 'foo'});

// create a model stored in the 'users' collection, 'default' connection, 'other-db' database
var User = AccessMongo.createModel('users', {database: 'other-db'});

// create a model stored in the 'users' collection, 'foo' connection, 'other-db' database
var User = AccessMongo.createModel('users', {connection: 'foo', database: 'other-db'});
```

### Model

#### Creating a query

```javascript
// create a query
var query = User.where({name: 'Matt Insler'});

// add to a query
query.where({email: 'matt.insler@gmail.com'});
```

#### Modifying a query

```javascript
// skip
User.skip(5);
User.where({...}).skip(5);

// limit

// fields
User.fields({name: 1, address});        // only include name and address
User.where({...}).fields({timestamp: 0}); // omit timestamp

// sort
User.sort({name: 1});             // sort by name ascending
User.where({...}).sort({name: -1}); // sort by name descending
```

#### Fetching data from a query

```javascript
// fetch the first document matching this query
User.first().then(function(user) {

});
User.where({...}).then(function(user) {

});

// fetch all documents matching this query
User.array().then(function(users) {

});
User.where({...}).array().then(function(users) {

});

// Create a cursor for this query
var cursor = User.cursor();
var cursor = User.where({...}).cursor();

// Count the documents matching this query
User.count().then(function(count) {

});
User.where({...}).count().then(function(count) {

});

// Get a list of distinct values of the field matching this query
User.distinct('name').then(function(distinctNames) {

});
User.where({...}).distinct('name').then(function(distinctNames) {

});
```

### Inserting/updating documents

```javascript
// Insert a document, will not update
User.create({...}).then(function(savedDocument) {

);
// Insert multiple documents, will not update
User.create([{...}, {...}]).then(function(arrayOfSavedDocuments) {

);

// Save a document, doing an update if the document has an '_id' field, and an insert if not
User.save({...}).then(function(savedDocument) {

});

// Update a single document matching the query
// options: http://mongodb.github.io/node-mongodb-native/1.4/api-generated/collection.html#update
User.update(query, update, options).then(function(numDocumentsChanged, details) {
  // check details.updatedExisting to see if objects were inserted or updated (when using {upsert: true})
});
// Update a single document matching the query from the where({...})
User.where({...}).update(update, options).then(function(numDocumentsChanged, details) {

});


User.where({...}).firstAndUpdate(update, options).then(function(fetchedDocument) {
  
});
```

### Removing documents

```javascript
// To prevent you from removing all documents by accident, this will throw an Error
User.remove();

// Remove all documents matching this query
User.where({...}).remove().then(function(numDocumentsRemoved) {

});
```

## Lower-level API

### AccessMongo

#### Get the default connection

Returns the default connection object if there is a one or `null`.

This is the equivalent of `AccessMongo.getConnection('default')`.

```javascript
var connection = AccessMongo.getDefaultConnection();
```

#### Get a connection by name

Returns the connection object by name or `null`.

```javascript
var connection = AccessMongo.getConnection('foo');
```

### Connection

#### Get the default database

```javascript
var db = connection.getDefaultConnection();
```

#### Get a database by name

```javascript
var db = connection.getDatabase('my-db');
```

#### Disconnect this connection

```javascript
connection.disconnect();
```

### Database

#### Get a collection from the database

```javascript
var collection = db.getCollection('users');
```

## License
Copyright (c) 2015 Matt Insler
Licensed under the MIT license.
