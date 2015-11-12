// Load in our dependencies
var async = require('async');
var assert = require('assert');
var concat = require('concat-stream');
var which = require('which');
var _gm = require('gm');
var engine = {};
var settings = {};

// Determine if GraphicsMagick exists on our `PATH`
var gmExists = false;
try {
  gmExists = !!which.sync('gm');
} catch (e) {
  // Ignore errors for `gm` not existing
}

// Helper function to set settings
// ANTI-PATTERN: We are treaing gmsmith as a singleton and should re-design to use `engine` as a constructor
function set(options) {
  // Save settings
  Object.getOwnPropertyNames(options).forEach(function saveOption (key) {
    settings[key] = options[key];
  });
}

// Helper method to clear all settings
function clear() {
  settings = {};
}

// Getter method for settings
function get(key) {
  return settings[key];
}

// Helper method for grabbing gm instance (graphicsmagick vs imagemagick)
function getGm() {
  var useImagemagick = get('imagemagick');
  if (useImagemagick || (useImagemagick === undefined && !gmExists)) {
    return _gm.subClass({imageMagick: true});
  } else {
    return _gm;
  }
}

// Expose get/set to engine
engine.get = get;
engine.set = set;
engine.clearSettings = clear;

function Canvas() {
  var gm = getGm();
  var canvas = gm(1, 1, 'transparent');

  // Override the -size options (won't work otherwise)
  canvas._in = ['-background', 'transparent'];

  // Save the canvas
  this.canvas = canvas;
}
// Define mapping for extensions to gm counterpart
Canvas.formatToExtMap = {
  png: 'png',
  'image/png': 'png',
  jpg: 'jpeg',
  jpeg: 'jpeg',
  'image/jpg': 'jpeg',
  'image/jpeg': 'jpeg'
};
Canvas.prototype = {
  addImage: function addImage (img, x, y, cb) {
    // Add the image
    var canvas = this.canvas;

    // TODO: Pull request this in to gm
    canvas.out('-page');
    canvas.out('+' + x + '+' + y);
    canvas.out(img.file);
  },
  'export': function exportFn (options, cb) {
    // Flatten the image (with transparency)
    var canvas = this.canvas;
    canvas.mosaic();

    // Render the item
    return this._exportCanvas(options, cb);
  },

  /**
   * gm exporter
   * @param {Object} options Options to export with
   * @param {Number} [options.quality] Quality of the exported item
   * @param {Function} cb Error-first callback to return binary image string to
   */
  _exportCanvas: function (options, cb) {
    // Extract our extension
    var format = options.format || 'png';
    var ext = Canvas.formatToExtMap[format];
    assert(ext, '`gmsmith` doesn\'t support exporting a "' + format + '". Please export either a `png` or `jpeg`');

    // Update the quality of the canvas (if specified)
    var canvas = this.canvas;
    var quality = options.quality;
    if (quality !== undefined) {
      canvas.quality(quality);
    }

    // Export our data via a stream
    // https://github.com/aheckmann/gm/blob/1.21.1/lib/command.js#L116-L144
    var retStream = canvas.stream(ext);
    retStream.on('error', cb);
    retStream.pipe(concat(function handleBuff (buff) {
      cb(null, buff.toString('binary'));
    }));
  }
};

// Expose Canvas to engine
engine.Canvas = Canvas;

// Define our async canvas creator
// DEV: Our canvas is dynamically defined by x/y of each image
function createCanvas(width, height, callback) {
  // Generate our canvas and then callback with it in a bit
  var canvas = new Canvas();
  process.nextTick(function handleNextTick () {
    callback(null, canvas);
  });
}
engine.createCanvas = createCanvas;

// Write out Image as a static property of Canvas
/**
 * @param {String} file File path to load in
 * @param {Function} callback Error first callback to retrun the image from
 * @prop {Number} image.width
 * @prop {Number} image.height
 * @note Must be guaranteed to integrate into own library via .addImage
 */
function createImage(file, callback) {
  // Create the image
  var gm = getGm();
  var img = gm(file);

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
}
engine.createImage = createImage;

function createImages(files, callback) {
  // Map the files into their image counterparts
  // DEV: Magic number of 10 to prevent file descriptor overuse
  // This does not affect perf -- 12 seconds with 300, 11.5 with 10 for 2000 images (derp)
  async.mapLimit(files, 10, createImage, callback);
}
engine.createImages = createImages;

// Export the canvas
engine.specVersion = '1.1.0';
module.exports = engine;
