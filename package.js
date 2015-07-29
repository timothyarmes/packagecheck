var PackageVersion = require('./package-version-parser');

// Given a package constraint, check if the user has the latest version
//
// Returns true if output has been sent to the console

var checkPackage = function(packageConstraint) {

  var splitString = packageConstraint.split('@');
  var version = (splitString.length > 1) ? splitString[1] : null;

  if (version) {

    var packageName = splitString[0];

    try {
      var latestVersion = Version.getLatest(packageName);
      if (latestVersion) {
        if (PackageVersion.lessThan(version, latestVersion)) {
          console.log(packageName + ' version ' + latestVersion + ' is available (' + version + ' currently specified).');
          return true;
        } else if (verbose) {
          console.log(packageName + ' version ' + latestVersion + ' is up to date.');
          return true;
        }
      }
      else {
        console.log(packageName + ": version information not found.");
        return true;
      }
    }
    catch (e) {
      console.log(e);
      return true
    }
  }
  else {
    console.log(packageConstraint + ' does not have version contraint.');
    return true;
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
  add_files: function() { if (warnings) console.log("Warning: Package uses deprecated 'add_files' declaration. Use 'addFiles' instead.") },

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
    console.log("=> Checking package " + description.name + '...');
  },

  onUse: function(fn) {
    fn(api);
  },

  on_use: function(fn) {
    if (warnings) console.log("Warning: Package uses deprecated 'on_use' declaration. Use 'onUse' instead.")
    fn(api);
  },

  onTest: function(fn) {
    fn(api);
  },

  on_test: function(fn) {
    if (warnings) console.log("Warning: Package uses deprecated 'on_test' declaration. Use 'onTest' instead.")
    fn(api);
  },

  registerBuildPlugin: function(description) {
    api.use(description.use);
  }

}

module.exports = Package;
