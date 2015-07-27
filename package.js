var exec = require('sync-exec');

var PackageVersion = require('./package-version-parser');

// Given a package constraint, check if the user has the latest version
//
// Rather than reimplement Meteor's entire package database mechanism in order
// to get the latest versions, we simply call out to Meteor's command line.

var checkPackage = function(packageConstraint) {

  var splitString = packageConstraint.split('@');
  var version = (splitString.length > 1) ? splitString[1] : null;

  if (version) {

    var packageName = splitString[0];

    // Use the command line to get the latest versions of this package

    var result = exec('meteor show ' + packageName);

    if (result.status != 0) {
      console.log('Call to `meteor show` failed.')
      console.log(error);
      exit(1);
    }

    var lines = result.stdout.split('\n');
    var idx = 0;
    var latest = null;

    // Find the list of recent versions
    while (idx < lines.length && lines[idx++] !== 'Recent versions:') ;

    // Get the last line in this list
    while (idx < lines.length && lines[idx] !== '') {
      latest = lines[idx];
      idx++;
    }

    // If we have a line, get the version and test
    if (latest !== null) {
      latestVersion = latest.split(' ').filter(function(item) { return item != ''; })[0];
      if (PackageVersion.lessThan(version, latestVersion)) {
        console.log(packageName + ' version ' + latestVersion + ' is available (' + version + ' currently specified)');
        return true;
      }
    }
  }

  return false;
}

// api object to be passed to the Package.onUse function

var api = {

  // Define empty functions for parts of the API that don't interest us

  versionsFrom: function() {},
  imply: function() {},
  export: function() {},
  addFiles: function() {},

  // The `use` function is called with the list of packages that we need to check

  use: function(packageConstraints) {

    // The user can either pass an array or a string, we need to handle both cases

    var updatesAvailable = false
    if (packageConstraints.constructor === Array) {
      packageConstraints.forEach(function(packageConstraint) {
        if (checkPackage(packageConstraint))
          updatesAvailable = true;
      });
    }
    else {
      if (checkPackage(packageConstraints))
        updatesAvailable = true;
    }

    // Insert a blank link between packages if there were updates displayed

    if (updatesAvailable)
      console.log();

  }

}

// We need to export our own Package object that will be called by the user's package.js script

var Package = {

  describe: function(description) {
    console.log("Checking package " + description.name + '...');
  },

  onUse: function(fn) {
    fn(api);
  },

  onTest: function(fn) {
    fn(api);
  }

}

module.exports = Package;
