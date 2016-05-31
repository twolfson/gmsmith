// Load in our dependencies
var assert = require('assert');

// Define our canvas constructor
function Canvas(width, height, gmsmith) {
  // DEV: Our canvas dimensions are dynamically defined by x/y of each image
  var canvas = gmsmith.gm(1, 1, 'transparent');

  // Override the -size options (won't work otherwise)
  canvas._in = ['-background', 'transparent'];

  // Save the canvas
  this.canvas = canvas;
  this.width = width;
  this.height = height;
}
Canvas.defaultFormat = 'png';
Canvas.supportedFormats = ['png', 'jpg', 'jpeg'];
Canvas.prototype = {
  addImage: function addImage (img, x, y) {
    // Add the image
    var canvas = this.canvas;

    // TODO: Pull request this in to gm
    canvas.out('-page');
    canvas.out('+' + x + '+' + y);
    canvas.out(img.file);
  },
  'export': function exportFn (options) {
    // Flatten the image (with transparency)
    var canvas = this.canvas;
    canvas.mosaic();

    // Validate our format
    var format = options.format || Canvas.defaultFormat;
    assert(Canvas.supportedFormats.indexOf(format) !== -1,
      '`gmsmith` doesn\'t support exporting a "' + format + '". Please export either a `png` or `jpeg`');

    // Extent to given size
    canvas.gravity('NorthWest').extent(this.width, this.height, '!');

    // Update the quality of the canvas (if specified)
    var quality = options.quality;
    if (quality !== undefined) {
      canvas.quality(quality);
    }

    // Export our data via a stream
    // https://github.com/aheckmann/gm/blob/1.21.1/lib/command.js#L116-L144
    return canvas.stream(format);
  }
};

// Export our Canvas
module.exports = Canvas;
