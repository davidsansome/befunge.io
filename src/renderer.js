goog.provide('befunge.Renderer');

goog.require('befunge.Coord');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyHandler');
goog.require('goog.Timer');

/**
 * @constructor
 * @param {string} containerId
 * @param {!befunge.Interpreter} interpreter
 */
befunge.Renderer = function(containerId, interpreter) {
  var that = this;

  this.container = document.getElementById(containerId);
  this.interpreter = interpreter;

  this.cursor = new befunge.Coord();
  this.textDirection = new befunge.Coord([1]);
  this.threadCursors = {};

  // Cursor blinking.
  this.cursorBlink = true;
  this.cursorBlinkTimer = new goog.Timer(1000);
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
      goog.bind(this.handleKeyEvent_, this));

  goog.events.listen(
      this.interpreter,
      befunge.EventType.THREAD_STARTED,
      function (e) {
        that.threadCursors[e.context.id] = e.context.position;
      });
  goog.events.listen(
      this.interpreter,
      befunge.EventType.THREAD_FINISHED,
      function (e) {
        delete that.threadCursors[e.context.id];
      });
  goog.events.listen(
      this.interpreter,
      befunge.EventType.THREAD_POSITION_CHANGED,
      function (e) {
        that.threadCursors[e.context.id] = e.context.position;
      });
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
  'x': 3 / befunge.Renderer.FONT_SIZE,
  'y': -2 / befunge.Renderer.FONT_SIZE
};


/**
 * Colors to use for thread instruction pointers.
 * @const
 * @type {!Array.<string>}
 */
befunge.Renderer.THREAD_COLORS = [
  '#f00',
  '#0ff',
  '#ff0',
  '#f0f',
];


befunge.Renderer.prototype.sizeChanged = function() {
  this.ctx = this.container.getContext('2d');

  // Scale so that each character is 1x1.
  this.ctx.scale(befunge.Renderer.FONT_SIZE, befunge.Renderer.FONT_SIZE);
  this.ctx.lineWidth = 1.0 / befunge.Renderer.FONT_SIZE;
  this.ctx.font = '1px Inconsolata';
  this.ctx.textBaseline = 'top';
  this.ctx.strokeStyle = '#0F0';

  this.width = this.ctx.canvas.width / befunge.Renderer.FONT_SIZE;
  this.height = this.ctx.canvas.height / befunge.Renderer.FONT_SIZE;

  this.render();
};


befunge.Renderer.prototype.render = function() {
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
      this.ctx.fillStyle = befunge.Renderer.THREAD_COLORS[
          threadId % befunge.Renderer.THREAD_COLORS.length];
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


befunge.Renderer.prototype.renderChar_ = function(value, x, y) {
  this.ctx.fillText(
      String.fromCharCode(value),
      x + befunge.Renderer.FONT_OFFSET['x'],
      y + befunge.Renderer.FONT_OFFSET['y']);
};


befunge.Renderer.prototype.handleKeyEvent_ = function(e) {
  switch (e.keyCode) {
    case goog.events.KeyCodes.LEFT:
      this.moveCursor(-1, 0);
      break;
    case goog.events.KeyCodes.UP:
      this.moveCursor(0, -1);
      break;
    case goog.events.KeyCodes.RIGHT:
      this.moveCursor(1, 0);
      break;
    case goog.events.KeyCodes.DOWN:
      this.moveCursor(0, 1);
      break;
    case goog.events.KeyCodes.BACKSPACE:
      var inverseDirection = this.textDirection.clone();
      inverseDirection.multiplyScalar(-1);

      this.cursor.increment(inverseDirection);
      // falthrough
    case goog.events.KeyCodes.DELETE:
      this.interpreter.space.set(this.cursor, befunge.Space.EMPTY_VALUE);

      this.resetCursorBlinkTimer();
      this.render();
      break;
    default:
      if (e.charCode != 0) {
        switch (e.charCode) {
          case 118:  // v
            this.textDirection = new befunge.Coord([0, 1]);
            break;
          case 94:  // ^
            this.textDirection = new befunge.Coord([0, -1]);
            break;
          case 60:  // <
            this.textDirection = new befunge.Coord([-1]);
            break;
          case 62:  // >
            this.textDirection = new befunge.Coord([1]);
            break;
        }

        this.interpreter.space.set(this.cursor, e.charCode);
        this.cursor.increment(this.textDirection);
        this.resetCursorBlinkTimer();
        this.render();
        break;
      }
      return;  // Importantly, don't preventDefault() below.
  }
  e.preventDefault();
};


/**
 * Moves the cursor by the given number of characters.
 * @param {number} deltaX
 * @param {number} deltaY
 */
befunge.Renderer.prototype.moveCursor = function(deltaX, deltaY) {
  this.cursor.increment(new befunge.Coord([deltaX, deltaY]));
  this.resetCursorBlinkTimer();
  this.render();
};


befunge.Renderer.prototype.resetCursorBlinkTimer = function() {
  this.cursorBlink = true;
  this.cursorBlinkTimer.stop();
  this.cursorBlinkTimer.start();
};
