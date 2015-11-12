// Load in our dependencies
var assert = require('assert');
var concat = require('concat-stream');

// Define our canvas constructor
function Canvas(width, height, gmsmith) {
  // Ignore width/height
  // DEV: Our canvas dimensions are dynamically defined by x/y of each image
  var canvas = gmsmith.gm(1, 1, 'transparent');

  // Override the -size options (won't work otherwise)
  canvas._in = ['-background', 'transparent'];

  // Save the canvas
  this.canvas = canvas;
}
// Define mapping for extensions to gm counterpart
Canvas.supportedFormats = ['png', 'jpeg'];
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

    // Extract our extension
    var format = options.format;
    assert(format, '`gmsmith` expected `options.format` to be provided to `canvas.export` but it was not');
    assert(Canvas.supportedFormats.indexOf(format) !== -1,
      '`gmsmith` doesn\'t support exporting a "' + format + '". Please export either a `png` or `jpeg`');

    // Update the quality of the canvas (if specified)
    var quality = options.quality;
    if (quality !== undefined) {
      canvas.quality(quality);
    }

    // Export our data via a stream
    // https://github.com/aheckmann/gm/blob/1.21.1/lib/command.js#L116-L144
    var retStream = canvas.stream(format);
    retStream.on('error', cb);
    retStream.pipe(concat(function handleBuff (buff) {
      cb(null, buff.toString('binary'));
    }));
  }
};
