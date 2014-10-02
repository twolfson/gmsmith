// Load our dependencies
var spritesmithEngineTest = require('spritesmith-engine-test');

// If we are on Windows, skip over performance test (it cannot handle the long argument string)
if (process.platform === 'win32') {
  delete outline['interpretting a ridiculous amount of images'];
}

// Run our tests
spritesmithEngineTest.run({
  engine: gmsmith,
  engineName: 'gmsmith'
});
