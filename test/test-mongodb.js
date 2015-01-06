var q = require('q');
var mongodb = require('mongodb');
var shared = require('./shared');
var AccessMongo = require('../');

var MONGODB_URL = 'mongodb://localhost/access-mongo-test';

describe('MongoDB Provider', function() {
  before(function() {
    this.cleanup = function() {
      return q.ninvoke(mongodb.MongoClient, 'connect', MONGODB_URL).then(function(db) {
        return q.ninvoke(db, 'dropDatabase');
      });
    };
    
    this.setup = function() {
      return AccessMongo.connect(MONGODB_URL);
    };
  });
  
  shared.interfaceTest();
  
  // it('create', function() {
  //   var User = AccessMongo.createModel('users');
  //
  //   return User.create({foo: 'bar'}).then(function() {
  //     console.log(arguments);
  //   });
  // });
  //
  // it('create multiple', function() {
  //   var User = AccessMongo.createModel('users');
  //
  //   return User.create([{foo: 'bar'}, {baz: 123}]).then(function() {
  //     console.log(arguments);
  //   });
  // });
  //
  // it('save', function() {
  //   var User = AccessMongo.createModel('users');
  //
  //   return User.save({foo: 'bar'}).then(function() {
  //     console.log(arguments);
  //   });
  // });
  //
  // it('update', function() {
  //   var User = AccessMongo.createModel('users');
  //
  //   return User.where({yo: 'man'}).update({$inc: {count: 1}}, {upsert: true}).then(function() {
  //     console.log(arguments);
  //   });
  // });
  //
  // it('find', function() {
  //   var User = AccessMongo.createModel('users');
  //
  //   return User.array().then(console.log);
  // });
  //
  // it('remove', function() {
  //   var User = AccessMongo.createModel('users');
  //
  //   return User.where({foo: 'bar'}).remove().then(function() {
  //     console.log(arguments);
  //   });
  // });
});
