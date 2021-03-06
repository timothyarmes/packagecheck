#! /usr/bin/env node

var fs = require('fs');
var path = require('path');
var sync = require('sync');
var selfupdate = require('selfupdate');
var packageJSON = require('./package.json');

var minimistOpts = {
   boolean: ['u','v','w', 'unconstrained', 'verbose', 'warnings']
}

var argv = require('minimist')(process.argv.slice(2), minimistOpts);

Version = require('./version');
Package = require('./package');
Npm = require('./npm');

function help() {

  var help = [
    "Usage: packagecheck [-uvw] [--unconstrained] [--verbose] [--warnings] [path] ...",
    "       packagecheck --version",
    "       packagecheck --selfupdate",
    "",
    "Checks to see if package dependencies used by a Meteor package are up-to-date.",
    "",
    "With no arguments, 'packagecheck' will check the current directory, which can ",
    "either be a single package, a Meteor 'packages' directory or a Meteor project ",
    "directory (in the latter two cases all the individual packages will be checked).",
    "",
    "Alternatively you may pass in paths to either individual packages, ",
    "'packages' directories or Meteor project directories.",
    "",
    "The following options are available:",
    "",
    "  -u, --unconstrained   Always warn about use of unconstrained dependencies.",
    "  -v, --verbose         Display output for all dependencies, even if they are up-to-date.",
    "  -w, --warnings        Warn about use of deprecated declarations etc.",
    ""
  ].join('\n');

  console.log(help);
  process.exit(0);
}

if (argv.help == true) {
  help();
  process.exit(0);
}

// Flags

unconstrained = (argv.unconstrained || argv.u) ? true : false;
verbose = (argv.verbose || argv.v) ? true : false;
warnings = (argv.warnings || argv.w) ? true : false;

if (argv.selfupdate) {

  // Do a self update if requested

  selfupdate.update(packageJSON, function(error, version) {
    if (error) throw error;
    console.log('packagecheck was updated to version: ' + version);
  });
}
else {

  // We use sync to check for updates, then continue with main function

  sync(function(){

    if (argv.version == true)
      console.log('PackageCheck ' + packageJSON.version);

    try {
      var isUpdated = selfupdate.isUpdated.sync(null, packageJSON);
      if (!isUpdated)
        console.log("There is a new version of packagecheck available. Please run 'packagecheck --selfupdate' to upgrade.");
    }
    catch (e) {}

    if (argv.version == true)
      process.exit(0);

    // Get the list of folders passed to the command, or just use the current folder otherwise

    var folders = argv._
    if (folders.length == 0) {
      folders = [ '.' ];
    }

    // Check each folder

    folders.forEach(function(folder) {

      var scanPackages = function(absolute) {
        fs.readdirSync(absolute).filter(function(file) {
          var potentialPackage = path.join(absolute, file);
          if (fs.statSync(potentialPackage).isDirectory()) {
            var packagePath = path.join(potentialPackage, 'package.js');
            if (fs.existsSync(packagePath)) {
              // This is a package folder, we just check this package
              require(packagePath);
            }
          }
        });
      }

      var absolute = path.resolve(folder);
      var packagePath = path.join(absolute, 'package.js');
      var meteorPath = path.join(absolute, '.meteor');

      // We change the processes working directory to the root project directory.
      // Some plugins expect this (such as meteorhacks:npm), and so does our code.

      cwd = process.cwd()
      while (!fs.existsSync(path.join(cwd, '.meteor')) && cwd !== "/") {
         cwd = path.resolve(cwd, '..')
      }
      process.chdir(cwd);

      if (fs.existsSync(meteorPath)) {
        // We're in a Meteor project directy - check the packages folder
        var packagesPath = path.join(absolute, 'packages');
        if (fs.existsSync(packagesPath) && fs.statSync(packagesPath).isDirectory()) {
          scanPackages(packagesPath);
        }
        else {
          console.log('No packages folder found in this project.');
          console.log('');
          process.exit(1);
        }
      }
      else if (path.basename(absolute) === "packages") {
        scanPackages(absolute);
      }
      else if (fs.existsSync(packagePath)) {
        require(packagePath);
      }
      else {
        console.log('Unable to open ' + packagePath);
        console.log('');
        help();
        process.exit(1);
      }
    });
  });
}
