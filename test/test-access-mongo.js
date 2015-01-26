var assert = require('assert');
var AccessMongo, AccessMongo2;

var MONGODB_URL = 'mongodb://localhost/access-mongo-test';

describe('AccessMongo', function() {
  before(function() {
    delete require.cache[require.resolve('../')];
    AccessMongo = require('../');
    delete require.cache[require.resolve('../')];
    AccessMongo2 = require('../');
  });
  
  after(function() {
    AccessMongo.disconnect();
    AccessMongo2.disconnect();
  });
  
  it('can accept AccessMongo connections', function() {
    return AccessMongo.connect(MONGODB_URL).then(function() {
      return AccessMongo2.connect(AccessMongo.getDefaultConnection());
    }).then(function() {
      assert.equal(AccessMongo2.getDefaultConnection().connection, AccessMongo.getDefaultConnection().connection);
    });
  });
  
  it('can accept MongoDB connections', function() {
    return AccessMongo.connect(MONGODB_URL).then(function() {
      return AccessMongo2.connect(AccessMongo.getDefaultConnection().connection);
    }).then(function() {
      assert.equal(AccessMongo2.getDefaultConnection().connection, AccessMongo.getDefaultConnection().connection);
    });
  });
});
