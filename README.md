# packagecheck

There is a movement towards using packages for everything when developing Meteor applications (the [Telescope][1] project is a perfect example of this philosophy). Structuring Meteor applications [in this way][2] has many advantages, however it does pose one annoying issue - it's no longer possible to run `meteor list` to see if there are any updates to packages that you're using.

`PackageCheck` is a command-line utility that addresses this shortcoming by checking to see if package dependencies used by a Meteor package are themselves up to date.

## Installation

    npm install -g packagecheck

## Updating

	packagecheck --selfupdate

## Usage

    Usage: packagecheck [-uvw] [--unconstrained] [--verbose] [--warnings] [path] ...
           packagecheck --version
           packagecheck --selfupdate

With no arguments, 'packagecheck' will check the current directory, which can either be a single package, a Meteor 'packages' directory or a Meteor project directory (in the latter two cases all the individual packages will be checked).
Alternatively you may pass in paths to either individual packages, 'packages' directories or Meteor project directories.

The following options are available:

    -u, --unconstrained   Always warn about use of unconstrained dependencies.
	-v, --verbose         Display output for all dependencies, even if they are up-to-date.
    -w, --warnings        Warn about use of deprecated declarations etc.

[1]: https://github.com/TelescopeJS/Telescope
[2]: https://meteor.hackpad.com/Building-Large-Apps-Tips-d8PQ848nLyE
