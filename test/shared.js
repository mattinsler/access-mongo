var q = require('q');
var assert = require('assert');
var AccessMongo = require('../');

exports.interfaceTest = function() {
  before(function() {
    return this.setup();
  });
  
  after(function() {
    var self = this;
    return AccessMongo.disconnect().then(function() {
      return self.cleanup();
    });
  });
  
  it('should save and find first', function() {
    var User = AccessMongo.createModel('users');
  
    var user = {
      _id: '123',
      name: 'Matt Insler',
      email: 'matt@mattinsler.com',
      createdAt: new Date()
    };
  
    return User.save(user).then(function() {
      return User.where({_id: user._id}).first().then(function(newUser) {
        assert.deepEqual(user, newUser);
      });
    });
  });
};
