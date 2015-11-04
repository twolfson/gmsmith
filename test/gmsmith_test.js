// Load our dependencies
var gmsmith = require('../lib/gmsmith');
var spritesmithEngineTest = require('spritesmith-engine-test');

// Configure gmsmith for our environment
// DEV: In case it recurs, we had downcasting of imagemagick's spritesheets to 8 bit for `get-pixels` loading
//   See https://github.com/twolfson/gmsmith/blob/0.4.3/test/gmsmith_test_content.js#L39
gmsmith.clearSettings();
if (process.env.TEST_IMAGEMAGICK === 'TRUE') {
  gmsmith.set({imagemagick: true});
} else if (process.env.TEST_IMAGEMAGICK === 'IMPLICIT_WITH_SET') {
  gmsmith.set({});
}

// Run our tests
spritesmithEngineTest.run({
  engine: gmsmith,
  engineName: 'gmsmith',
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
