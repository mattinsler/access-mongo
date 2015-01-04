var q = require('q');
var Query = require('./query');

var Model = function(collection) {
  this.collection = collection;
};

Model.prototype.where = function(query) {
  return new Query(this).where(query);
};

Model.prototype.skip = function(docsToSkip) {
  return this.where().skip(docsToSkip);
};

Model.prototype.limit = function(docsToLimit) {
  return this.where().limit(docsToLimit);
};

Model.prototype.fields = function(fieldsToFilter) {
  return this.where().fields(fieldsToFilter);
};

Model.prototype.sort = function(sortDescription) {
  return this.where().sort(sortDescription);
};

Model.prototype.first = function() {
  return this.where().first();
};

Model.prototype.array = function() {
  return this.where().array();
};

Model.prototype.count = function() {
  return this.where().count();
};

Model.prototype.distinct = function(key, options) {
  return this.where().distinct(key, options);
};

Model.prototype.cursor = function() {
  return this.where().cursor();
};


/**
 * Creates one or more documents.
 * @param {Object|Array} document
 */
Model.prototype.create = function(document, options) {
  return q.ninvoke(this.collection, 'insert', document, options);
};

/**
 * Creates or overwrites a single document.
 * @param {Object} document
 */
Model.prototype.save = function(document, options) {
  return q.ninvoke(this.collection, 'save', document, options);
};

Model.prototype.update = function(query, update, options) {
  return q.ninvoke(this.collection, 'update', query, update, options);
};


/*

  Model.createModel('collection');
  Model.createModel('collection', {connection: 'my-conn'});
  Model.createModel('collection', {database: 'my-db'});
  Model.createModel('collection', {connection: 'my-conn', database: 'my-db'});

*/
Model.createModel = function(collectionName, opts) {
  if (!opts) opts = {};
  
  var Kimongo = require('./kimongo');
  var connection = opts.connection ? Kimongo.getConnection(opts.connection) : Kimongo.getDefaultConnection();
  var database = opts.database ? connection.db(opts.database) : connection;
  var collection = database.collection(collectionName);
  
  return new Model(collection);
};

module.exports = Model;