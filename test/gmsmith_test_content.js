// Load in parts to make our content
var smith = require('../lib/gmsmith'),
    extend = require('obj-extend'),
    commonTest = require('spritesmith-engine-test').content;

// Duck punch over test items
var content = extend({}, commonTest, {
  'gmsmith': function () {
    this.smith = smith;
    smith.set({imagemagick: process.env.TEST_IMAGEMAGICK});

    var expectedDir = __dirname + '/expected_files/';
    this.expectedFilepaths = [
      expectedDir + '/multiple.png',
      expectedDir + '/multiple2.png',
      expectedDir + '/multiple3.png',
      expectedDir + '/multiple4.png'
    ];
  },
  'can output an image':  function () {
    // Assert the actual image is the same expected
    var actualImage = this.result,
        matchesAnImage = false;

    // ANTI-PATTERN: Looping over set without identifiable lines for stack traces
    var fs = require('fs');
    var expect = require('chai').expect;
    this.expectedFilepaths.forEach(function testAgainstExpected (filepath) {
      if (!matchesAnImage) {
        var expectedImage = fs.readFileSync(filepath, 'binary');
        matchesAnImage = actualImage === expectedImage;
      }
    });

    // console.log(encodeURIComponent(actualImage));

    expect(matchesAnImage).to.equal(true);
  }
});

// If we are on Windows, skip performance test items
if (process.platform === 'win32') {
  delete content["interpretting a ridiculous amount of images"];
  delete content["does not crash"];
  delete content["returns an image"];
}

// Export the content
module.exports = content;