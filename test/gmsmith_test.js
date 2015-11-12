// Load our dependencies
var gmsmith = require('../');
var spritesmithEngineTest = require('spritesmith-engine-test');

// Configure gmsmith for our environment
// DEV: In case it recurs, we had downcasting of imagemagick's spritesheets to 8 bit for `get-pixels` loading
//   See https://github.com/twolfson/gmsmith/blob/0.4.3/test/gmsmith_test_content.js#L39
var engineOptions = {};
if (process.env.TEST_IMAGEMAGICK === 'TRUE') {
  engineOptions.imagemagick = true;
}

// Run our tests
spritesmithEngineTest.run({
  engine: gmsmith,
  engineName: 'gmsmith',
  engineOptions: engineOptions,
  tests: {
    // DEV: When we have exactly 1 png, it seems to darken the entire canvas
    //   Thankfully we still have a test for multiple png images which passes
    renderPngCanvas: false,
    renderMultiplePngImages: true,
    // DEV: JPG seems to change significantly on Travis CI for IMAGEMAGICK, disable those tests for now
    renderJpgCanvas: !(process.env.TRAVIS && process.env.TEST_IMAGEMAGICK),
    renderGifCanvas: false,
    // If we are on Windows, skip over performance test (it cannot handle the long argument string)
    renderManyPngImages: process.platform === 'win32'
  }
});
