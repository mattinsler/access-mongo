var q = require('q');
var fs = require('fs');
var path = require('path');
var nedb = require('nedb');

var Collection = function(datastore) {
  this.datastore = datastore;
  
  var self = this;
  ['ensureIndex', 'removeIndex', 'insert', 'count', 'find', 'findOne','remove'].forEach(function(key) {
    self[key] = self.datastore[key].bind(self.datastore);
  });
};

Collection.prototype.update = function(query, update, options, cb) {
  this.datastore.update(query, update, options || {}, cb);
};

Collection.prototype.save = function(doc, options, cb) {
  if (!options) { options = {}; }
  
  if (doc._id) {
    var id = doc._id;
    delete doc._id;
    this.update({_id: id}, doc, {upsert: true, multi: options.multi}, cb);
  } else {
    this.insert(doc, cb);
  }
};

var Database = function(databaseDir) {
  this.databaseDir = databaseDir;
  this.collections = {};
};

Database.prototype.getCollection = function(collectionName) {
  if (!this.collections[collectionName]) {
    this.collections[collectionName] = new Collection(
      new nedb({
        filename: path.join(this.databaseDir, collectionName),
        autoload: true
      })
    );
  }
  
  return this.collections[collectionName];
};

var Connection = function(connectionDir) {
  this.type = 'nedb';
  this.connectionDir = connectionDir;
  this.databases = {};
};

Connection.prototype.disconnect = function() {
  delete this.databases;
};

Connection.prototype.getDefaultDatabase = function() {
  return this.getDatabase('default');
};

Connection.prototype.getDatabase = function(dbName) {
  if (!this.databases[dbName]) {
    var dbPath = path.join(this.connectionDir, dbName);
  
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath);
    } else if (!fs.statSync(dbPath).isDirectory()) {
      throw new Error('');
    }
  
    this.databases[dbName] = new Database(dbPath);
  }
  
  return this.databases[dbName];
};

var NedbProvider = {
  type: 'nedb',
  Connection: Connection,
  Database: Database,
  
  connect: function(url) {
    return q().then(function() {
      if (fs.existsSync(url)) {
        if (fs.statSync(url).isDirectory()) {
          return;
        } else {
          throw new Error('');
        }
      } else {
        fs.mkdirSync(url);
      }
    }).then(function() {
      return new Connection(url);
    });
  }
};

module.exports = NedbProvider;
