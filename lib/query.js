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
  return this.model.getCollection().then(function(collection) {
    return q.ninvoke(collection, 'update', self.query, update, options);
  });
};


Query.prototype.remove = function(options) {
  if (Object.keys(this.query).length === 0) {
    return q.reject(new Error('You are not allowed to remove all documents from a model'));
  }
  
  var self = this;
  return this.model.getCollection().then(function(collection) {
    return q.ninvoke(collection, 'remove', self.query, options);
  });
};

module.exports = Query;
