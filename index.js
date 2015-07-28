#! /usr/bin/env node

var fs = require('fs');
var path = require('path');
var argv = require('minimist')(process.argv.slice(2));

Package = require('./package');
Npm = require('./npm');

function help() {

  var help = [
    "Usage: packagecheck [--verbose] [path] ...",
    "       packagecheck --version",
    "",
    "packagecheck checks to see if package dependencies used by a Meteor package",
    "are themselves up to date.",
    "",
    "With no arguments, 'packagecheck' will check the current directory, which can ",
    "either be a single package, a Meteor 'packages' directory or a Meteor project ",
    "directory (in the latter two cases all the individual packages will be checked).",
    "",
    "Alternatively you may pass in paths to either individual packages, ",
    "'packages' directories or Meteor project directories.",
    ""
  ].join('\n');

  console.log(help);
  process.exit(0);
}

if (argv.help == true) {
  help();
  process.exit(0);
}

if (argv.version == true) {
  var pjson = require('./package.json');
  console.log('PackageCheck ' + pjson.version);
  process.exit(0);
}

// Flags

verbose = argv.verbose ? argv.verbose : false;

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
    // We're in a packages folder - check all packages.
    // We change the processes working directory to the root project directory
    // since some plugins expect this (such as meteorhacks:npm)
    process.chdir('..');
    scanPackages(absolute);
  }
  else if (fs.existsSync(packagePath)) {
    // This is a package folder, we just check this package
    // We change the processes working directory to the root project directory
    // since some plugins expect this (such as meteorhacks:npm)
    process.chdir('../..');
    require(packagePath);
  }
  else {
    console.log('Unable to open ' + packagePath);
    console.log('');
    help();
    process.exit(1);
  }

});
