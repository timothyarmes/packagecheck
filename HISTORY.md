
# Version History

## 0.1.11

* Fixed one thing, broke another. Sorry.

## 0.1.10

* The ability to pass a path to check was broken, this has been fixed.

## 0.1.9

* Don't fail when hitting an error when examining an unconstrained package

## 0.1.8

* The version actually used by a project for **unconstrained** dependencies is now checked.
* Added `--unconstrained` option to always warn of the use of unconstrained dependencies (even if the latest version is being used by the project).
* Added `--warn` option to warn about used of deprecated declarations etc.
* Added single letter options flags (`-uvw`).
* Added check to warn if there's a newer version of packagecheck available.
* Added '--selfupdate' option to update packagecheck to the latest version.
* Performance enhancements.

## 0.1.7

* Added a --verbose flag
* Added support for use of deprecated `on_use` and `on_test`.

## 0.1.1 - 0.1.6

* Initial release + bug fixes based on first uses in the wild.
