goog.provide('befunge.Renderer2D');

goog.require('befunge.Coord');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyHandler');
goog.require('goog.Timer');

/**
 * @constructor
 * @param {string} canvasId
 * @param {!befunge.Interpreter} interpreter
 */
befunge.Renderer2D = function(canvasId, interpreter) {
  befunge.Renderer.call(this, canvasId, interpreter);
};
goog.inherits(befunge.Renderer2D, befunge.Renderer);


befunge.Renderer2D.prototype.sizeChanged = function() {
  this.ctx = this.canvas.getContext('2d');

  // Scale so that each character is 1x1.
  this.ctx.scale(befunge.Renderer2D.FONT_SIZE, befunge.Renderer2D.FONT_SIZE);
  this.ctx.lineWidth = 1.0 / befunge.Renderer2D.FONT_SIZE;
  this.ctx.font = '1px Inconsolata';
  this.ctx.textBaseline = 'top';
  this.ctx.strokeStyle = '#0F0';

  this.width = this.ctx.canvas.width / befunge.Renderer2D.FONT_SIZE;
  this.height = this.ctx.canvas.height / befunge.Renderer2D.FONT_SIZE;

  this.render();
};


befunge.Renderer2D.prototype.render = function() {
  // The number of characters on each side of the cursor to draw.
  var charsInView = {
    'x': Math.ceil(this.width / 2),
    'y': Math.ceil(this.height / 2)
  };

  var viewBounds = {
    'x1': this.cursor.get(0) - charsInView['x'],
    'y1': this.cursor.get(1) - charsInView['y'],
    'x2': this.cursor.get(0) + charsInView['x'] + 1,
    'y2': this.cursor.get(1) + charsInView['y'] + 1,
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

  // Clear the entire canvas.
  this.ctx.fillStyle = '#000';
  this.ctx.fillRect(0, 0, this.width, this.height);

  // Translate such that the top-left corner of plane[0][0] is at 0,0.
  this.ctx.save();
  this.ctx.translate(
      - (1.5 - (this.width / 2 % 1)),
      - (1.5 - (this.height / 2 % 1)));

  // Draw the characters in the funge space.
  this.ctx.fillStyle = '#0F0';
  for (var y = 0; y < plane.length; ++y) {
    var line = plane[y];

    for (var x = 0; x < line.length; ++x) {
      var v = line[x];
      if (v == befunge.Space.EMPTY_VALUE) {
        continue;
      }

      this.renderChar_(v, x, y);
    }
  }

  // Draw the thread positions.
  for (var threadId in this.threadCursors) {
    var pos = this.threadCursors[threadId];
    var x = pos.get(0) - viewBounds['x1'];
    var y = pos.get(1) - viewBounds['y1'];
    if (x >= 0 && y >= 0 &&
        pos.get(0) <= viewBounds['x2'] &&
        pos.get(1) <= viewBounds['y2']) {
      this.ctx.fillStyle = befunge.Renderer2D.THREAD_COLORS[
          threadId % befunge.Renderer2D.THREAD_COLORS.length];
      this.ctx.fillRect(x, y, 1, 1);

      // Redraw the character.
      this.ctx.fillStyle = '#000';
      this.renderChar_(plane[y][x], x, y);
    }
  }

  // Draw the cursor.
  if (this.cursorBlink) {
    this.ctx.fillStyle = '#0F0';
    this.ctx.fillRect(charsInView['x'], charsInView['y'], 1, 1);

    // Redraw the character.
    this.ctx.fillStyle = '#000';
    this.renderChar_(
        plane[charsInView['y']][charsInView['x']],
        charsInView['x'],
        charsInView['y']);
  }

  this.ctx.restore();
};


befunge.Renderer2D.prototype.renderChar_ = function(value, x, y) {
  this.ctx.fillText(
      String.fromCharCode(value),
      x + befunge.Renderer2D.FONT_OFFSET['x'],
      y + befunge.Renderer2D.FONT_OFFSET['y']);
};
