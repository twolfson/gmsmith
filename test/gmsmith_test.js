// Load our dependencies
var spritesmithEngineTest = require('spritesmith-engine-test');

// Run our tests
spritesmithEngineTest.run({
  engine: gmsmith,
  engineName: 'gmsmith',
  options: {
    // If we are on Windows, skip over performance test (it cannot handle the long argument string)
    // TODO: Implement this flag
    skipRidiculousImagesTest: process.platform === 'win32'
  }
});
