// This is a hack, but it's worth it to control the number of connections to the DB.
// if (global['--access_mongo--']) { return global['--access_mongo--']; }

var q = require('q');

var DEFAULT_DB = 'default';

var connections = {
  connecting: {},
  connected: {}
};

var AccessMongo = {
  connections: connections
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
    if (typeof(opts) === 'string') { return createConnection(DEFAULT_DB, opts); }
    
    return q.all(
      Object.keys(opts).map(function(key) {
        return createConnection(key, opts[key])
          .then(function(db) {
            obj[key] = db;
          });
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
    Object.keys(connections.connected).map(function(key) {
      return connections.connected[key].disconnect();
    })
  ).then(function() {
    connections = {
      connecting: {},
      connected: {}
    };
    
    return self;
  });
};

var createConnection = function(key, url) {
  if (connections.connected[key]) return connections.connected[key];
  if (connections.connecting[key]) return connections.connecting[key];
  
  return q().then(function() {
    var promise;
    var parsedUrl = require('url').parse(url);
    
    if (parsedUrl.protocol === 'mongodb:') {
      promise = AccessMongo.MongodbProvider.connect(url);
    } else if (!parsedUrl.protocol) {
      promise = AccessMongo.NedbProvider.connect(url);
    } else {
      throw new Error('No provider available');
    }
    
    connections.connecting[key] = promise;
    
    promise.then(function(conn) {
      delete connections.connecting[key];
      connections.connected[key] = conn;
    });
    
    return promise;
  }).catch(function(err) {
    err.message = '[' + url + '] ' + err.message;
    throw err;
  });
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
AccessMongo.MongodbProvider = require('./mongodb-provider');
AccessMongo.NedbProvider = require('./nedb-provider');
AccessMongo.createModel = AccessMongo.Model.createModel;

// module.exports = global['--access_mongo--'] = AccessMongo;
