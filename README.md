# access-mongo

Simple MongoDB wrapper

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

```

## License
Copyright (c) 2015 Matt Insler
Licensed under the MIT license.
