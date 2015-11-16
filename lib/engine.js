// Load in our dependencies
var async = require('async');
var which = require('which');
var _gm = require('gm');
var Canvas = require('./canvas');

// Determine if GraphicsMagick exists on our `PATH`
var gmExists = false;
try {
  gmExists = !!which.sync('gm');
} catch (e) {
  // Ignore errors for `gm` not existing
}

// Define our engine constructor
function Gmsmith(options) {
  this.gm = _gm;
  var useImageMagick = options.hasOwnProperty('imagemagick') ? options.imagemagick : !gmExists;
  if (useImageMagick) {
    this.gm = _gm.subClass({imageMagick: true});
  }
}
Gmsmith.specVersion = '2.0.0';
Gmsmith.prototype = {
  createCanvas: function (width, height) {
    // Generate our canvas and then callback with it in a bit
    var canvas = new Canvas(width, height, this);
    return canvas;
  },
  createImage: function (file, callback) {
    // If the file is an object (i.e. a vinyl object)
    if (typeof file === 'object') {
      // If it's not null, warn the users about loading excess content
      if (!file.isNull()) {
        console.warn('`gmsmith` doesn\'t support in-memory content ' +
          'but we saw in-memory content for "' + file.path + '". ' +
          'This can be disabled via `read: false` in `gulp.src`');
      }

      // Use the file path from the vinyl object
      file = file.path;
    }

    // Create the image
    var img = this.gm(file);

    // In series...
    async.waterfall([
      // Grab the size
      function getImgSize (cb) {
        img.size(cb);
      },
      function saveImgSize (size, cb) {
        // Create a structure for preserving the height and width of the image
        var imgFile = {
          height: size.height,
          width: size.width,
          file: file
        };

        // Callback with the imgFile
        cb(null, imgFile);
      }
    ], callback);
  },
  createImages: function (files, callback) {
    // Map the files into their image counterparts
    // DEV: Magic number of 10 to prevent file descriptor overuse
    // This does not affect perf -- 12 seconds with 300, 11.5 with 10 for 2000 images (derp)
    async.mapLimit(files, 10, this.createImage.bind(this), callback);
  }
};

// Export the engine
module.exports = Gmsmith;
