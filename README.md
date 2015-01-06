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

// create an nedb database
AccessMongo.connect('test.db').then(function() {
  var User = AccessMongo.createModel('users');
  
  User.where({name: 'Matt'}).then(function(user) {
    console.log(user);
  });
});

```

## License
Copyright (c) 2015 Matt Insler
Licensed under the MIT license.
