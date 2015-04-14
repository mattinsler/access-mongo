var q = require('q');

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
  this.shouldDisconnect = opts.shouldDisconnect || true;
};

Connection.prototype.disconnect = function() {
  if (this.shouldDisconnect) {
    return q.ninvoke(this.connection, 'close');
  } else {
    return q();
  }
}; 

Connection.prototype.getDefaultDatabase = function() {
  return new Database(this.connection);
};

Connection.prototype.getDatabase = function(dbName) {
  if (!dbName) { return this.getDefaultDatabase(); }
  return new Database(this.connection.db(dbName));
};

var MongodbProvider = {
  type: 'mongodb',
  Connection: Connection,
  Database: Database,
  
  connect: function(url) {
    if (typeof(url) === 'string') {
      return q.ninvoke(MongodbProvider.mongodb.MongoClient, 'connect', url).then(function(db) {
        return new Connection(db);
      });
    }
    
    if (url.constructor === MongodbProvider.mongodb.Db) {
      return q(new Connection(url, {shouldDisconnect: false}));
    }
    
    if (url.constructor === Connection) {
      return q(new Connection(url.connection, {shouldDisconnect: false}));
    }
    
    return q.reject(new Error('MongoDB connections must either be a string or current connections'));
  }
};

module.exports = MongodbProvider;
