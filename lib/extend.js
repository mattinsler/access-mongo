module.exports = function extend() {
  var dst = {};
  var args = Array.prototype.slice.call(arguments);
  
  for (var x = 0; x < args.length; ++x) {
    var src = args[x];
    for (var k in src) {
      if (src.hasOwnProperty(k)) {
        dst[k] = src[k];
      }
    }
  }
  
  return dst;
};
