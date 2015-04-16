var q = require('q');
var extend = require('./extend');
var betturl = require('betturl');

var Database = function(db) {
  this.db = db;
};

Database.prototype.getCollection = function(collectionName) {
  return this.db.collection(collectionName);
};

var Connection = function(connection, opts) {
  this.type = 'mongodb';
  this.connection = connection;
  
  if (!opts) { opts = {}; }
  this.opts = {
    defaultDatabase: opts.defaultDatabase,
    shouldDisconnect: opts.shouldDisconnect || true
  };
};

Connection.prototype.disconnect = function() {
  if (this.opts.shouldDisconnect) {
    return q.ninvoke(this.connection, 'close');
  } else {
    return q();
  }
}; 

Connection.prototype.getDefaultDatabase = function() {
  if (this.opts.defaultDatabase) {
    return this.getDatabase(this.opts.defaultDatabase);
  } else {
    return new Database(this.connection);
  }
};

Connection.prototype.getDatabase = function(dbName) {
  if (!dbName) { return this.getDefaultDatabase(); }
  return new Database(this.connection.db(dbName));
};

var createCacheKey = function(parsed) {
  var hosts = parsed.hosts.map(function(h) {
    return h.host + ':' + h.port;
  }).sort().join(',');
  
  var auth = parsed.auth && parsed.auth.user && parsed.auth.password ? parsed.auth.user + ':' + parsed.auth.password : '';
  
  var query = '';
  if (parsed.query.replicaSet) {
    query += parsed.query.replicaSet;
  }
  
  return 'hosts[' + hosts + ']auth[' + auth + ']query[' + query + ']';
};

var createMongodbURL = function(parsed, opts) {
  var url = 'mongodb://';
  if (!opts) { opts = {}; }
  
  var query = extend({}, parsed.query, opts);
  
  if (parsed.auth && parsed.auth.password) {
    url += [
      parsed.auth.user || '',
      parsed.auth.password
    ].join(':') + '@';
    
    if (parsed.path.slice(1)) {
      query.authSource = parsed.path.slice(1);
    }
  }
  
  url += parsed.hosts.map(function(h) {
    return h.host + ':' + (h.port || 27017);
  }).join(',');
  
  var queryString = Object.keys(query).map(function(k) {
    return encodeURIComponent(k) + '=' + encodeURIComponent(query[k]);
  }).join('&');
  
  if (queryString) { url += '?' + queryString; }
  
  return url;
};

var MongodbProvider = {
  type: 'mongodb',
  cache: {},
  Connection: Connection,
  Database: Database,
  
  connect: function(url, opts) {
    if (typeof(url) === 'string') {
      var parsed = betturl.parse(url);
      var key = createCacheKey(parsed);
      
      var connPromise;
      if (MongodbProvider.cache[key]) {
        connPromise = MongodbProvider.cache[key];
      } else {
        url = createMongodbURL(parsed, opts);
        connPromise = MongodbProvider.cache[key] = q.ninvoke(MongodbProvider.mongodb.MongoClient, 'connect', url);
      }
      
      return connPromise.then(function(db) {
        return new Connection(db, {
          defaultDatabase: parsed.path.slice(1)
        });
      });
    }
    
    if (url.constructor === MongodbProvider.mongodb.Db) {
      // default database?
      return q(new Connection(url, {shouldDisconnect: false}));
    }
    
    if (url.constructor === Connection) {
      var opts = extend({}, url.opts, {shouldDisconnect: false});
      return q(new Connection(url.connection, opts));
    }
    
    return q.reject(new Error('MongoDB connections must either be a string or current connections'));
  }
};

module.exports = MongodbProvider;
