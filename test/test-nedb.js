var del = require('del');
var shared = require('./shared');
var AccessMongo = require('../');

var DB_PATH = 'test.db';

describe.skip('NEDB Provider', function() {
  before(function() {
    this.cleanup = function() {
      del.sync(DB_PATH);
    };
    
    this.setup = function() {
      return AccessMongo.connect(DB_PATH);
    };
  });
  
  shared.interfaceTest();
});
