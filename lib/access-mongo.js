var q = require('q');
var mongodb = require('mongodb');

var DEFAULT_DB = 'default';

var AccessMongo = {
  mongodb: mongodb
};
var connections = {
  connecting: {},
  connected: {}
};

/*
  
  AccessMongo.connect('mongodb://foo:bar@hello.com:1234/mydb');
  AccessMongo.connect({
    foo: 'mongodb://foo:bar@hello.com:1234/mydb',
    bar: 'mongodb://foo:bar@yoyo.foo.bar:1234/otherdb'
  });
  
  */
AccessMongo.connect = function(opts) {
  if (typeof(opts) === 'string') {
    return createConnection(DEFAULT_DB, opts);
  }
  
  var obj = {};
  return q.all(
    Object.keys(opts).map(function(key) {
      return createConnection(key, opts[key])
        .then(function(db) {
          obj[key] = db;
        });
    })
  )
  .then(function() {
    return obj;
  });
};

var createConnection = function(key, url) {
  if (connections.connected[key]) return connections.connected[key];
  
  if (!connections.connecting[key]) {
    var deferred = q.defer();
    connections.connecting[key] = deferred;
    
    mongodb.MongoClient.connect(url, function(err, db) {
      delete connections.connecting[key];
      if (err) {
        err.message = '[' + url + '] ' + err.message;
        return deferred.reject(err);
      }
      
      connections.connected[key] = db;
      deferred.resolve(db);
    });
  }
  
  return connections.connecting[key].promise;
};

AccessMongo.getConnection = function(connectionName) {
  return connections.connected[connectionName];
};

AccessMongo.getDefaultConnection = function() {
  return AccessMongo.getConnection(DEFAULT_DB);
};


// Require these last so they get loaded after the methods above are defined

AccessMongo.Model = require('./model');
AccessMongo.Query = require('./query');
AccessMongo.createModel = AccessMongo.Model.createModel;

module.exports = AccessMongo;
