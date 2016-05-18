var q = require('q');
var extend = require('./extend');

var Query = function(model) {
  this.model = model;
  this.query = {};
  this.options = {};
};

Query.prototype.where = function(query) {
  if (query) {
    this.query = extend(this.query, query);
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
  var self = this;
  return this.model.getCollection().then(function(collection) {
    return q.ninvoke(collection.find(self.query, self.options), 'nextObject');
  });
};

Query.prototype.array = function() {
  var self = this;
  return this.model.getCollection().then(function(collection) {
    return q.ninvoke(collection.find(self.query, self.options), 'toArray');
  });
};

Query.prototype.count = function() {
  var self = this;
  return this.model.getCollection().then(function(collection) {
    return q.ninvoke(collection.find(self.query, self.options), 'count');
  });
};

Query.prototype.distinct = function(key, options) {
  var self = this;
  return this.model.getCollection().then(function(collection) {
    return q.ninvoke(collection, 'distinct', key, self.query, options);
  });
};

Query.prototype.cursor = function() {
  var self = this;
  return this.model.getCollection().then(function(collection) {
    return collection.find(self.query, self.options);
  });
};

Query.prototype.update = function(update, options) {
  var self = this;
  var opts = extend({}, this.model.getDefaultWriteConcern(), options || {});

  return this.model.getCollection().then(function(collection) {
    return q.ninvoke(collection, 'update', self.query, update, opts);
  });
};

Query.prototype.firstAndUpdate = function(update, options) {
  var self = this;
  var opts = extend({}, this.model.getDefaultWriteConcern(), options || {});
  var sort = this.options.sort || opts.sort || {_id: 1};

  return this.model.getCollection().then(function(collection) {
    return q.ninvoke(collection, 'findAndModify', self.query, sort, update, opts).then(function(arr) {
      // return only the document, not the results
      return arr[0];
    });
  });
};


Query.prototype.remove = function(options) {
  var self = this;
  var opts = extend({}, this.model.getDefaultWriteConcern(), options || {});

  if (Object.keys(this.query).length === 0 && options.override !== true) {
    return q.reject(new Error('You are not allowed to remove all documents from a model'));
  }

  return this.model.getCollection().then(function(collection) {
    return q.ninvoke(collection, 'remove', self.query, opts);
  });
};

module.exports = Query;
