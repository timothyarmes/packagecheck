var fs = require('fs');
var exec = require('sync-exec');

Version = {}

Version.latest = {}

// Get the latest version of a given package

Version.getLatest = function(packageName) {

  // Check to see if we've cached this result

  if (Version.latest[packageName]) {
    return Version.latest[packageName];
  }

  // Rather than reimplement Meteor's entire package database mechanism in order
  // to get the latest versions, we simply call out to Meteor's command line.

  var result = exec('meteor show ' + packageName);

  if (result.status != 0) {
    throw(result.stderr);
  }
  else {
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
      Version.latest[packageName] = latestVersion;
      return latestVersion;
    }
  }
}

// Get the version of the given package that's actually used by the project

Version.getVersionUsed = function(packageName) {

  // Cached the used version info if we haven't already done so

  if (typeof Version.used === 'undefined') {

    Version.used = {};

    var versions = fs.readFileSync(".meteor/versions", { encoding: 'utf-8' });
    var lines = versions.split(EOL);

    lines.forEach(function(line) {

      var splitString = line.split('@');
      var version = (splitString.length > 1) ? splitString[1] : null;
      var name = splitString[0];

      if (version)
        Version.used[name] = version

    });
  }

  return Version.used[packageName];
}

module.exports = Version;
