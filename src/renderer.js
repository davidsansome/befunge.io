goog.provide('befunge.Renderer');

goog.require('befunge.Coord');

/**
 * @constructor
 * @param {string} containerId
 * @param {!befunge.Interpreter} interpreter
 */
befunge.Renderer = function(containerId, interpreter) {
  var container = document.getElementById(containerId);
  this.ctx = container.getContext('2d');
  this.interpreter = interpreter;
  //this.interpreter.space.writeLine(new befunge.Coord([0, 0]), '1  v');
  //this.interpreter.space.writeLine(new befunge.Coord([0, 1]), '@.7_8.@');

  this.interpreter.space.writeLine(new befunge.Coord([-10, -3]), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  this.interpreter.space.writeLine(new befunge.Coord([-10, -2]), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  this.interpreter.space.writeLine(new befunge.Coord([-10, -1]), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  this.interpreter.space.writeLine(new befunge.Coord([-10, 0]), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  this.interpreter.space.writeLine(new befunge.Coord([-10, 1]), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  this.interpreter.space.writeLine(new befunge.Coord([-10, 2]), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  this.interpreter.space.writeLine(new befunge.Coord([-10, 3]), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  this.interpreter.space.writeLine(new befunge.Coord([-10, 4]), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');

  this.cursor = new befunge.Coord();

  // Scale so that each character is 1x1.
  this.ctx.scale(befunge.Renderer.FONT_SIZE, befunge.Renderer.FONT_SIZE);
  this.ctx.lineWidth = 1.0 / befunge.Renderer.FONT_SIZE;
  this.ctx.font = '1px monospace';
  this.ctx.textBaseline = 'top';

  this.width = this.ctx.canvas.width / befunge.Renderer.FONT_SIZE;
  this.height = this.ctx.canvas.height / befunge.Renderer.FONT_SIZE;

  this.render();
};

befunge.Renderer.FONT_SIZE = 14;

befunge.Renderer.prototype.render = function() {
  // The number of characters on each side of the cursor to draw.
  var charsInView = {
    'x': Math.ceil(this.width / 2),
    'y': Math.ceil(this.height / 2)
  };

  // The character in the top-left of the view.  May only be partially inside
  // the bounding box.
  var topLeftCoord = this.cursor.clone();
  topLeftCoord.set(0, topLeftCoord.get(0) - charsInView['x']);
  topLeftCoord.set(1, topLeftCoord.get(1) - charsInView['y']);

  // Read the data from the funge space.
  var plane = this.interpreter.space.readPlane(
      topLeftCoord,
      [charsInView['x'] * 2 + 1,
       charsInView['y'] * 2 + 1]);

  this.ctx.clearRect(0, 0, this.width, this.height);

  this.ctx.save();
  this.ctx.translate(
      - (1.5 - (this.width / 2 % 1)),
      - (1.5 - (this.height / 2 % 1)));

  // Draw the characters in the funge space.
  for (var y = 0; y < plane.length; ++y) {
    var line = plane[y];
    var text = String.fromCharCode.apply(null, line);

    for (var x = 0; x < line.length; ++x) {
      var v = line[x];
      if (v == befunge.Space.EMPTY_VALUE) {
        continue;
      }

      this.ctx.fillText(String.fromCharCode(v), x, y);
    }
  }

  // Draw the cursor.


  this.ctx.restore();
};
