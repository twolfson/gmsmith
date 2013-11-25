// Load in parts to make our content
var exec = require('child_process').exec,
    async = require('async'),
    expect = require('chai').expect,
    deepEqual = require('deep-equal'),
    getPixels = require('get-pixels'),
    extend = require('obj-extend'),
    Tempfile = require('temporary/lib/file'),
    testContent = require('spritesmith-engine-test').content,
    smith = require('../lib/gmsmith');

// Duck punch over test items
var content = extend({}, testContent, {
  'gmsmith': function () {
    this.smith = smith;
    smith.set({imagemagick: process.env.TEST_IMAGEMAGICK});

    var expectedDir = __dirname + '/expected_files';
    this.expectedFilepaths = [
      expectedDir + '/multiple-gm.png',
      expectedDir + '/multiple-im.png'
    ];
  },
  'can output an image': [function saveResultToFile (done) {
    this.tmpFile1 = new Tempfile();
    this.tmpFile1.path += '.png';
    this.tmpFile1.writeFile(this.result, 'binary', done);
  }, function adjustBitDepth (done) {
    this.actualFile = this.tmpFile1;
    if (process.env.TEST_IMAGEMAGICK) {
      this.tmpFile2 = new Tempfile();
      this.tmpFile2.path += '.png';
      this.actualFile = this.tmpFile2;
      exec('convert ' + this.tmpFile1.path + ' -depth 8 ' + this.tmpFile2.path, done);
    } else {
      done();
    }
  }, function getActualPixels (done) {
    var that = this;
    getPixels(this.actualFile.path, function (err, actualPixels) {
      that.actualPixels = actualPixels;
      done(err);
    });
  }, function assertExpectedImages (done) {
    // Assert the actual image is the same expected
    var actualPixels = this.actualPixels,
        matchesAnImage = false;

    // ANTI-PATTERN: Looping over set without identifiable lines for stack traces
    async.forEachSeries(this.expectedFilepaths, function testAgainstExpected (filepath, cb) {
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

      expect(matchesAnImage).to.equal(true);
      done();
    });
  }, function cleanupFiles () {
    this.tmpFile1.unlinkSync();

    if (this.tmpFile2) {
      this.tmpFile2.unlinkSync();
    }
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