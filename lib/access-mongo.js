var q = require('q');
var clone = require('clone');
var EventEmitter = require('events').EventEmitter;
var isPlainObject = require('lodash.isplainobject');

var DEFAULT_DB = 'default';

var AccessMongo = {
  connections: {
    connecting: {},
    connected: {}
  }
};

var connectionEmitter = new EventEmitter();

var config = {
  lazy: false
};

AccessMongo.__defineGetter__('config', function() {
  return clone(config);
});

AccessMongo.configure = function(opts) {
  config = ['lazy'].reduce(function(o, k) {
    if (opts[k] !== null && opts[k] !== undefined) {
      o[k] = opts[k];
    }
    return o;
  }, {});
  return AccessMongo.config;
};

var writeConcern = {};
var WRITE_CONCERN_FIELDS = ['w', 'wtimeout', 'j', 'fsync'];

AccessMongo.setWriteConcern = function(opts) {
  writeConcern = WRITE_CONCERN_FIELDS.reduce(function(o, k) {
    if (opts[k] !== null && opts[k] !== undefined) {
      o[k] = opts[k];
    }
    return o;
  }, {});
  return AccessMongo.writeConcern;
};

AccessMongo.__defineGetter__('writeConcern', function() {
  return clone(writeConcern);
});

var createConnection = function(key, url, opts) {
  if (AccessMongo.connections.connected[key]) { return AccessMongo.connections.connected[key]; }
  if (AccessMongo.connections.connecting[key]) { return AccessMongo.connections.connecting[key]; }
  
  return q().then(function() {
    var promise;
    
    if (typeof(url) === 'string') {
      var parsedUrl = require('url').parse(url);
    
      if (parsedUrl.protocol === 'mongodb:') {
        promise = AccessMongo.MongodbProvider.connect(url, opts);
      } else if (!parsedUrl.protocol) {
        promise = AccessMongo.NedbProvider.connect(url, opts);
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
      connectionEmitter.emit(key);
    });
    
    return promise;
  }).catch(function(err) {
    connectionEmitter.removeAllListeners(key);
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
AccessMongo.connect = function(connections, opts) {
  return q().then(function() {
    if (!isPlainObject(connections)) {
      var connString = connections;
      connections = {};
      connections[DEFAULT_DB] = connString;
    }
    
    return q.all(
      Object.keys(connections).map(function(key) {
        return createConnection(key, connections[key], opts);
      })
    );
  }).then(function() {
    return AccessMongo;
  });
};

AccessMongo.disconnect = function() {
  // Object.keys(connections.connecting).forEach(function(key) {
  //
  // });
  
  return q.all(
    Object.keys(AccessMongo.connections.connected).map(function(key) {
      return AccessMongo.connections.connected[key].disconnect();
    })
  ).then(function() {
    connectionEmitter.removeAllListeners();
    AccessMongo.connections = {
      connecting: {},
      connected: {}
    };
    
    return AccessMongo;
  });
};

AccessMongo.getConnection = function(connectionName) {
  if (!connectionName) { connectionName = DEFAULT_DB; }
  return AccessMongo.connections.connected[connectionName];
};

AccessMongo.getDefaultConnection = function() {
  return AccessMongo.getConnection();
};

AccessMongo.getLazyConnection = function(connectionName) {
  if (!connectionName) { connectionName = DEFAULT_DB; }
  
  if (AccessMongo.connections.connected[connectionName]) {
    return q(AccessMongo.connections.connected[connectionName]);
  }
  
  var d = q.defer();
  connectionEmitter.once(connectionName, function() {
    d.resolve(AccessMongo.connections.connected[connectionName]);
  });
  return d.promise;
};

AccessMongo.getDefaultLazyConnection = function() {
  return AccessMongo.getLazyConnection();
};

AccessMongo.getCollection = function(opts) {
  if (config.lazy) {
    return AccessMongo.getLazyConnection(opts.connection).then(function(connection) {
      var database = connection.getDatabase(opts.database);
      return database.getCollection(opts.collection);
    });
  } else {
    return q().then(function() {
      var connection = AccessMongo.getConnection(opts.connection);
      if (!connection) { throw new Error('AccessMongo is not connected yet.'); }
      var database = connection.getDatabase(opts.database);
      if (!connection) { throw new Error('AccessMongo is not connected yet.'); }
      return database.getCollection(opts.collection);
    });
  }
};


// Require these last so they get loaded after the methods above are defined

AccessMongo.mongodb = require('mongodb');

AccessMongo.Model = require('./model');
AccessMongo.Model.AccessMongo = AccessMongo;

AccessMongo.Query = require('./query');
AccessMongo.MongodbProvider = require('./mongodb-provider');
AccessMongo.MongodbProvider.mongodb = AccessMongo.mongodb;
AccessMongo.NedbProvider = require('./nedb-provider');
AccessMongo.createModel = AccessMongo.Model.createModel;

module.exports = AccessMongo;
