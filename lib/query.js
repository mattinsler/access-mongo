var q = require('q');

// Stolen from https://github.com/Raynos/xtend/blob/master/mutable.js
var extend = function(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var Query = function(model) {
  this.model = model;
  this.query = {};
  this.options = {};
};

Query.prototype.where = function(query) {
  if (query) {
    extend(this.query, query);
  }
  return this;
};

Query.prototype.skip = function(docsToSkip) {
  this.options.skip = docsToSkip;
  return this;
};

Query.prototype.limit = function(docsToLimit) {
  this.options.limit = docsToLimit;
  return this;
};

Query.prototype.fields = function(fieldsToFilter) {
  this.options.fields = fieldsToFilter;
  return this;
};

Query.prototype.sort = function(sortDescription) {
  this.options.sort = sortDescription;
  return this;
};

Query.prototype.first = function() {
  return q.ninvoke(this.model.collection.find(this.query, this.options), 'nextObject');
};

Query.prototype.array = function() {
  return q.ninvoke(this.model.collection.find(this.query, this.options), 'toArray');
};

Query.prototype.count = function() {
  return q.ninvoke(this.model.collection.find(this.query, this.options), 'count');
};

Query.prototype.distinct = function(key, options) {
  return q.ninvoke(this.model.collection, 'distinct', key, this.query, options);
};

Query.prototype.cursor = function() {
  return this.model.collection.find(this.query, this.options);
};

Query.prototype.update = function(update, options) {
  return q.ninvoke(this.model.collection, 'update', this.query, update, options);
};


Query.prototype.remove = function(options) {
  if (Object.keys(this.query).length === 0) {
    return q.reject(new Error('You are not allowed to remove all documents from a model'));
  }
  return q.ninvoke(this.model.collection, 'remove', this.query, options);
};

module.exports = Query;
