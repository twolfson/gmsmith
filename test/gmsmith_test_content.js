// Load in parts to make our content
var smith = require('../lib/gmsmith'),
    async = require('async'),
    deepEqual = require('deep-equal'),
    extend = require('obj-extend'),
    getPixels = require('get-pixels'),
    ndarray = require('ndarray'),
    pngparse = require('pngparse'),
    commonTest = require('spritesmith-engine-test').content;

// Duck punch over test items
var content = extend({}, commonTest, {
  'gmsmith': function () {
    this.smith = smith;
    smith.set({imagemagick: process.env.TEST_IMAGEMAGICK});

    var expectedDir = __dirname + '/expected_files';
    this.expectedFilepaths = [
      expectedDir + '/multiple-gm.png',
      expectedDir + '/multiple-im.png'
    ];
  },
  'can output an image': [function convertResultToPixels (cb) {
    var that = this;
    require('fs').writeFileSync('a.png', this.result, 'binary');
    if (process.env.TEST_IMAGEMAGICK) {
      require('child_process').exec('convert a.png -depth 8 b.png', function (err, stderr, stdout) {
        console.log(err, stderr, stdout);
        getPixels('b.png', function (err, actualPixels) {
          that.actualPixels = actualPixels;
          cb(err);
        });
      });
    } else {
      getPixels('a.png', function (err, actualPixels) {
        that.actualPixels = actualPixels;
        cb(err);
      });
    }
  }, function assertExpectedImages (done) {
    // Assert the actual image is the same expected
    var actualPixels = this.actualPixels,
        matchesAnImage = false;

    // ANTI-PATTERN: Looping over set without identifiable lines for stack traces
    async.forEachSeries(this.expectedFilepaths, function testAgainstExpected (filepath, cb) {
      console.log('hey');
      if (matchesAnImage) {
        return cb();
      }

      getPixels(filepath, function (err, expectedPixels) {
        if (err) {
          return cb(err);
        }

        matchesAnImage = deepEqual(actualPixels, expectedPixels);
        cb();
      });
    }, function (err) {
      if (err) { return done(err); }

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