#! /usr/bin/env node

var fs = require('fs');
var path = require('path');
var argv = require('minimist')(process.argv.slice(2));

Package = require('./package');
Npm = require('./npm');

function help() {

  var help = [
    "Usage: packagecheck [package-folder-path] ...",
    "       packagecheck --version",
    "",
    "packagecheck checks to see if package dependencies used by a Meteor package",
    "are themselves up to date.",
    "",
    "With no arguments, 'packagecheck' will check the current directory,",
    "which can either be a single package or a Meteor 'packages' folder (in  which ",
    "case all the individual packages will be checked).",
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

// Get the list of folders passed to the command, or just use the current folder otherwise

var folders = argv._
if (folders.length == 0) {
  folders = [ '.' ];
}

// Check each folder

folders.forEach(function(folder) {

  var absolute = path.resolve(folder);
  var packagePath = path.join(absolute, 'package.js');
  if (fs.existsSync(packagePath)) {
    // This is a package folder, we just check this package
    require(packagePath);
  }
  else if (path.basename(absolute) === "packages") {
    // We're in a packages folder - check all packages.
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
  else {
    console.log('Unable to open ' + packagePath);
    console.log('');
    help();
    process.exit(1);
  }

});
