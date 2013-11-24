// Load in parts to make our content
var smith = require('../lib/gmsmith'),
    async = require('async'),
    extend = require('obj-extend'),
    getPixels = require('get-pixels'),
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
  'can output an image': [function convertResultToPixels (done) {
    console.log(this.result);
    done();
  }, function assertExpectedImages (done) {
    // Assert the actual image is the same expected
    var actualPixels = this.actualPixels,
        matchesAnImage = false;

    // ANTI-PATTERN: Looping over set without identifiable lines for stack traces
    async.forEachSeries(this.expectedFilepaths, function testAgainstExpected (filepath, cb) {
      if (matchesAnImage) {
        return;
      }

      getPixels(filepath, function (err, expectedPixels) {
        if (err) {
          return cb(err);
        }

        // TODO: Make this a deep equals
        matchesAnImage = actualPixels === expectedPixels;
      });
    }, function () {
      // console.log(encodeURIComponent(actualImage));
      var expect = require('chai').expect;
      expect(matchesAnImage).to.equal(true);
      done();
    });
  }]
});

// If we are on Windows, skip performance test items
if (process.platform === 'win32') {
  delete content["interpretting a ridiculous amount of images"];
  delete content["does not crash"];
  delete content["returns an image"];
}

// Export the content
module.exports = content;