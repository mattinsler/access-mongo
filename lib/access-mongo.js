var q = require('q');
var isPlainObject = require('lodash.isplainobject');

var DEFAULT_DB = 'default';

var AccessMongo = {
  connections: {
    connecting: {},
    connected: {}
  }
};

var createConnection = function(key, url) {
  if (AccessMongo.connections.connected[key]) { return AccessMongo.connections.connected[key]; }
  if (AccessMongo.connections.connecting[key]) { return AccessMongo.connections.connecting[key]; }
  
  return q().then(function() {
    var promise;
    
    if (typeof(url) === 'string') {
      var parsedUrl = require('url').parse(url);
    
      if (parsedUrl.protocol === 'mongodb:') {
        promise = AccessMongo.MongodbProvider.connect(url);
      } else if (!parsedUrl.protocol) {
        promise = AccessMongo.NedbProvider.connect(url);
      } else {
        throw new Error('No provider available');
      }
    } else {
      promise = AccessMongo.MongodbProvider.connect(url);
    }
    
    AccessMongo.connections.connecting[key] = promise;
    
    promise.then(function(conn) {
      delete AccessMongo.connections.connecting[key];
      AccessMongo.connections.connected[key] = conn;
    });
    
    return promise;
  }).catch(function(err) {
    err.message = '[' + url + '] ' + err.message;
    throw err;
  });
};


/*
  
  AccessMongo.connect('mongodb://foo:bar@hello.com:1234/mydb');
  AccessMongo.connect({
    foo: 'mongodb://foo:bar@hello.com:1234/mydb',
    bar: 'mongodb://foo:bar@yoyo.foo.bar:1234/otherdb'
  });
  
  */
AccessMongo.connect = function(opts) {
  var self = this;
  
  return q().then(function() {
    if (!isPlainObject(opts)) {
      var connString = opts;
      opts = {};
      opts[DEFAULT_DB] = connString;
    }
    
    return q.all(
      Object.keys(opts).map(function(key) {
        return createConnection(key, opts[key]);
      })
    );
  }).then(function() {
    return self;
  });
};

AccessMongo.disconnect = function() {
  // Object.keys(connections.connecting).forEach(function(key) {
  //
  // });
  
  var self = this;
  
  return q.all(
    Object.keys(AccessMongo.connections.connected).map(function(key) {
      return AccessMongo.connections.connected[key].disconnect();
    })
  ).then(function() {
    AccessMongo.connections = {
      connecting: {},
      connected: {}
    };
    
    return self;
  });
};

AccessMongo.getConnection = function(connectionName) {
  return AccessMongo.connections.connected[connectionName];
};

AccessMongo.getDefaultConnection = function() {
  return AccessMongo.getConnection(DEFAULT_DB);
};


// Require these last so they get loaded after the methods above are defined

AccessMongo.Model = require('./model');
AccessMongo.Query = require('./query');
AccessMongo.MongodbProvider = require('./mongodb-provider');
AccessMongo.NedbProvider = require('./nedb-provider');
AccessMongo.createModel = AccessMongo.Model.createModel;

module.exports = AccessMongo;
