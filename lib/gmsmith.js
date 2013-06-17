var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    assert = require('assert'),
    Tempfile = require('temporary/lib/file'),
    _gm = require('gm'),
    exporters = {},
    engine = {},
    settings = {};

// Helper function to set settings
// ANTI-PATTERN: We are treaing gmsmith as a singleton and should re-design the API to have options at every step
function set(options) {
  // Fallback `imagemagick' setting (to rollback when no longer using the engine)
  options.imagemagick = options.imagemagick || false;

  // Save settings
  Object.getOwnPropertyNames(options).forEach(function saveOption (key) {
    settings[key] = options[key];
  });
}

// Getter method for settings
function get(option) {
  return settings.imagemagick;
}

// Helper method for grabbing gm instance (graphicsmagick vs imagemagick)
function getGm() {
  if (get('imagemagick')) {
    return _gm.subClass({ imageMagick: true });
  } else {
    return _gm;
  }
}

// Expose get/set to engine
engine.get = get;
engine.set = set;

// Heorku doesn't have Graphics Magick
if (process.env.IMAGE_MAGICK) {
  gm = gm.subClass({ imageMagick: true });
}

function Canvas() {
  var gm = getGm(),
      canvas = gm(1, 1, 'transparent');

  // Override the -size options (won't work otherwise)
  canvas._in = ['-background', 'transparent'];

  // Save the canvas
  this.canvas = canvas;
}
Canvas.prototype = {
  'addImage': function addImage (img, x, y, cb) {
    // Add the image
    var canvas = this.canvas;

    // TODO: Pull request this in to gm
    canvas.out('-page');
    canvas.out('+' + x + '+' + y);
    canvas.out(img.file);
  },
  'export': function exportFn (options, cb) {
    // Grab the exporter
    var canvas = this.canvas,
        format = options.format || 'png',
        exporter = exporters[format];

    // Assert it exists
    assert(exporter, 'Exporter ' + format + ' does not exist for spritesmith\'s gm engine');

    // Flatten the image (with transparency)
    canvas.mosaic();

    // Render the item
    exporter.call(this, options, cb);
  }
};

// Expose Canvas to engine
engine.Canvas = Canvas;

// Create paths for the scratch directory and transparent pixel
function createCanvas(width, height, cb) {
  // Generate a scratch file
  var scratchFile = new Tempfile(),
      filepath = scratchFile.path + '.png';

  async.waterfall([
    function generateCanvas (cb) {
      // Generate a transparent canvas
      var gm = getGm(),
          base = gm(width, height, 'transparent');

      // Write out the base file
      base.write(filepath, cb);
    },
    function destroyScratchFile (x, y, z, cb) {
      // Ignore destory errors
      fs.unlink(filepath, function () {
        cb(null);
      });
    },
    function loadBackCanvas (cb) {
      // Create a canvas
      var canvas = new Canvas();

      // Callback with it
      cb(null, canvas);
    }
  ], cb);
}

// Expose createCanvas to engine
engine.createCanvas = createCanvas;

// Write out Image as a static property of Canvas
/**
 * @param {String} file File path to load in
 * @param {Function} callback Error first callback to retrun the image from
 * @prop {Number} image.width
 * @prop {Number} image.height
 * @note Must be guaranteed to integrate into own library via .addImage
 */
function createImage(file, cb) {
  // Create the image
  var gm = getGm(),
      img = gm(file);

  // In series...
  async.waterfall([
    // Grab the size
    function getImgSize (cb) {
      img.size(cb);
    },
    function saveImgSize (size, cb) {
      // Create a structure for preserving the height and width of the image
      var imgFile = {
        'height': size.height,
        'width': size.width,
        'file': file
      };

      // Callback with the imgFile
      cb(null, imgFile);
    }
  ], cb);
}
engine.createImage = createImage;

function createImages(files, cb) {
  // Map the files into their image counterparts
  // DEV: Magic number of 10 to prevent file descriptor overuse
  // This does not affect perf -- 12 seconds with 300, 11.5 with 10 for 2000 images (derp)
  async.mapLimit(files, 10, createImage, cb);
}
engine.createImages = createImages;

// Function to add new exporters
function addExporter(name, exporter) {
  exporters[name] = exporter;
}

// Expose the exporters
engine.exporters = exporters;
engine.addExporter = addExporter;

// Helper to create gm exporters (could be a class for better abstraction)
function getGmExporter(ext) {
  /**
   * Generic gm exporter
   * @param {Object} options Options to export with
   * @param {Number} [options.quality] Quality of the exported item
   * @param {Function} cb Error-first callback to return binary image string to
   */
  return function gmExporterFn (options, cb) {
    var canvas = this.canvas,
        file = new Tempfile(),
        filepath = file.path + '.' + ext;

    // Update the quality of the canvas (if specified)
    var quality = options.quality;
    if (quality !== undefined) {
      canvas.quality(quality);
    }

    async.waterfall([
      // Write to file
      function writeOutCanvas (cb) {
        canvas.write(filepath, cb);
      },
      // Read the file back in (in binary)
      function readInCanvas (x, y, z, cb) {
       fs.readFile(filepath, 'binary', cb);
      },
      // Destroy the file
      function destroyFile (retVal, cb) {
        fs.unlink(filepath, function () {
          cb(null, retVal);
        });
      }
    ], cb);
  };
}

// Generate the png exporter
var gmPngExporter = getGmExporter('png');
addExporter('png', gmPngExporter);
addExporter('image/png', gmPngExporter);

// Generate the jpeg exporter
var gmJpegExporter = getGmExporter('jpeg');
addExporter('jpg', gmJpegExporter);
addExporter('jpeg', gmJpegExporter);
addExporter('image/jpg', gmJpegExporter);
addExporter('image/jpeg', gmJpegExporter);

// This does not seem to be working at the moment
// // Generate the tiff exporter
// var gmTiffExporter = getGmExporter('tiff');
// addExporter('tiff', gmTiffExporter);
// addExporter('image/tiff', gmTiffExporter);

// Export the canvas
module.exports = engine;