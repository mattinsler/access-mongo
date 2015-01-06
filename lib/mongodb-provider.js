var q = require('q');
var mongodb = require('mongodb');

var Connection = function(connection) {
  this.type = 'mongodb';
  this.connection = connection;
};

Connection.prototype.disconnect = function() {
  return q.ninvoke(this.connection, 'close');
}; 

Connection.prototype.getDefaultDatabase = function() {
  return new Database(this.connection);
};

Connection.prototype.getDatabase = function(dbName) {
  return new Database(this.connection.db(dbName));
};

var Database = function(db) {
  this.db = db;
};

Database.prototype.getCollection = function(collectionName) {
  return this.db.collection(collectionName);
};

var MongodbProvider = {
  type: 'mongodb',
  Connection: Connection,
  Database: Database,
  
  connect: function(url) {
    return q.ninvoke(mongodb.MongoClient, 'connect', url).then(function(db) {
      return new Connection(db);
    });
  }
};

module.exports = MongodbProvider;
