// package.js file sometimes make use of Npm directives. We define an empty object so
// that the directives are ignored. If we don't do this then an error will be generated.

var Npm = {

  depends: function() {},
  require: require
}

module.exports = Npm;
