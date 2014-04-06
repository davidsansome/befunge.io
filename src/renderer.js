goog.provide('befunge.Renderer');

goog.require('befunge.Coord');
goog.require('goog.events.KeyHandler');
goog.require('goog.Timer');

/**
 * @constructor
 * @param {string} containerId
 * @param {!befunge.Interpreter} interpreter
 */
befunge.Renderer = function(containerId, interpreter) {
  var that = this;

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
  this.ctx.strokeStyle = '#0F0';

  this.width = this.ctx.canvas.width / befunge.Renderer.FONT_SIZE;
  this.height = this.ctx.canvas.height / befunge.Renderer.FONT_SIZE;

  // Cursor blinking.
  this.cursorBlink = false;
  this.cursorBlinkTimer = new goog.Timer(500);
  goog.events.listen(this.cursorBlinkTimer, goog.Timer.TICK, function(e) {
    that.cursorBlink = !that.cursorBlink;
    that.render();
  });
  this.cursorBlinkTimer.start();

  // Key handler.
  var keyHandler = new goog.events.KeyHandler(document);
  goog.events.listen(
      keyHandler,
      goog.events.KeyHandler.EventType.KEY,
      this.handleKeyEvent_,
      false,
      this);

  this.render();
};


/**
 * The font size to use, in pixels.
 * @const
 * @type {number}
 */
befunge.Renderer.FONT_SIZE = 14;


/**
 * How much to offset the character inside the box.
 * A hack because we don't have access to font metrics in JS.
 * @const
 * @type {!Object.<string, number>}
 */
befunge.Renderer.FONT_OFFSET = {
    'x': 2 / befunge.Renderer.FONT_SIZE,
    'y': -1 / befunge.Renderer.FONT_SIZE
};


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


befunge.Renderer.prototype.renderChar_ = function(value, x, y) {
  this.ctx.fillText(
      String.fromCharCode(value),
      x + befunge.Renderer.FONT_OFFSET['x'],
      y + befunge.Renderer.FONT_OFFSET['y']);
};


befunge.Renderer.prototype.handleKeyEvent_ = function(e) {
  switch (e.keyCode) {
    case 37:  // Left
      this.moveCursor(-1, 0);
      break;
    case 38:  // Up
      this.moveCursor(0, -1);
      break;
    case 39:  // Right
      this.moveCursor(1, 0);
      break;
    case 40:  // Down
      this.moveCursor(0, 1);
      break;
    default:
      return;
  }
  e.preventDefault();
};


/**
 * Moves the cursor by the given number of characters.
 * @param {number} deltaX
 * @param {number} deltaY
 */
befunge.Renderer.prototype.moveCursor = function(deltaX, deltaY) {
  this.cursorBlink = true;
  this.cursorBlinkTimer.stop();
  this.cursorBlinkTimer.start();
  this.cursor.increment(new befunge.Coord([deltaX, deltaY]));
  this.render();
};
