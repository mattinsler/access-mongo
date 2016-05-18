var q = require('q');
var Query = require('./query');
var extend = require('./extend');

var Model = function(opts) {
  this._opts = opts;
};

Model.prototype.getCollection = function() {
  return Model.AccessMongo.getCollection(this._opts);
};

Model.prototype.getDefaultWriteConcern = function() {
  return Model.AccessMongo.writeConcern;
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

Model.prototype.remove = function(options) {
  return this.where().remove(options);
};


/**
 * Creates one or more documents.
 * @param {Object|Array} document
 */
Model.prototype.create = function(document, options) {
  var isArray = Array.isArray(document);
  var opts = extend({}, this.getDefaultWriteConcern(), options || {});

  return this.getCollection().then(function(collection) {
    return q.ninvoke(collection, 'insert', document, opts).then(function(results) {
      return isArray ? results : results[0];
    });
  });
};

/**
 * Creates or overwrites a single document.
 * @param {Object} document
 */
Model.prototype.save = function(document, options) {
  var opts = extend({}, this.getDefaultWriteConcern(), options || {});

  return this.getCollection().then(function(collection) {
    return q.ninvoke(collection, 'save', document, opts);
  });
};

Model.prototype.update = function(query, update, options) {
  var opts = extend({}, this.getDefaultWriteConcern(), options || {});

  return this.getCollection().then(function(collection) {
    return q.ninvoke(collection, 'update', query, update, opts);
  });
};

Model.prototype.aggregate = function(pipeline, options) {
  return this.getCollection().then(function(collection) {
    return q.ninvoke(collection, 'aggregate', pipeline, options);
  });
};

Model.prototype.mapReduce = function(map, reduce, options) {
  return this.getCollection().then(function(collection) {
    return q.ninvoke(collection, 'mapReduce', map, reduce, options);
  });
};


/*

  Model.createModel('collection');
  Model.createModel('collection', {connection: 'my-conn'});
  Model.createModel('collection', {database: 'my-db'});
  Model.createModel('collection', {connection: 'my-conn', database: 'my-db'});

*/
Model.createModel = function(collectionName, opts) {
  if (!opts) { opts = {}; }
  opts.collection = collectionName;

  var model = new Model(opts);

  ['Binary', 'Code', 'DBRef', 'Double', 'Long', 'MaxKey', 'MinKey', 'ObjectID', 'Symbol', 'Timestamp'].forEach(function(type) {
    model[type] = Model.AccessMongo.mongodb[type];
  })

  return model;
};

module.exports = Model;
