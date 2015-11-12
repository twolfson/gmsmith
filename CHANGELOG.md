# gmsmith changelog
0.6.4 - Added `specVersion` to repository and `spritesmith-engine` to keywords

0.6.3 - Fixed failing Travis CI tests

0.6.2 - Cleaned up README and updated spec link to `spritesmith-engine-spec`

0.6.1 - Moved to `spritesmith-engine-test@3.0.0` to clean up technical debt

0.6.0 - Cleaned up technical debt (e.g. writing to disk, disjoint yet related parts of code)

0.5.4 - Removed `grunt` as a `devDependency`

0.5.3 - Added `twolfson-style` for linting

0.5.2 - Updated supported node versions to `>= 0.10.0`

0.5.1 - Added `foundry` for release

0.5.0 - Upgraded `gm` and `temporary` dependencies to add `node@0.12` and `iojs` support

0.4.5 - Added documentation for `quality`

0.4.4 - Upgraded to `spritesmith-engine-test@2.0.0` and moved to `mocha`

0.4.3 - Upgraded `npm` inside Travis CI to fix `node@0.8` issues

0.4.2 - Repaired legacy logic that caused 0.4.0 patch to fail whenever `.set` was called

0.4.1 - Re-enabling Travis CI tests for all supported node versions

0.4.0 - Implicitly discover `imagemagick` when `gm` doesn't exist and `imagemagick` flag is unspecified

0.3.0 - Added imagemagick to test suite and corrected `preinstall` for `package.json`

0.2.3 - Removed postinstall piping to allow cross-platform

0.2.2 - Integrated Travis CI

0.2.1 - Upgraded `doubleshot` and skipping `imagemagick` tests for approachability

0.2.0 - Added `get/set` support and `imagemagick` flag setting

0.1.3 - See `git log`
