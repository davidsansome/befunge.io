goog.provide('befunge.Renderer');

goog.require('befunge.Coord');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyHandler');
goog.require('goog.Timer');

/**
 * @constructor
 * @param {string} canvasId
 * @param {!befunge.Interpreter} interpreter
 */
befunge.Renderer = function(canvasId, interpreter) {
  var that = this;

  this.canvas = document.getElementById(canvasId);
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
};


befunge.Renderer.prototype.render = function() {
};


befunge.Renderer.prototype.handleKeyEvent_ = function(e) {
  switch (e.keyCode) {
    case goog.events.KeyCodes.LEFT:
      this.moveCursor_(-1, 0);
      break;
    case goog.events.KeyCodes.UP:
      this.moveCursor_(0, -1);
      break;
    case goog.events.KeyCodes.RIGHT:
      this.moveCursor_(1, 0);
      break;
    case goog.events.KeyCodes.DOWN:
      this.moveCursor_(0, 1);
      break;
    case goog.events.KeyCodes.BACKSPACE:
      var inverseDirection = this.textDirection.clone();
      inverseDirection.multiplyScalar(-1);

      this.cursor.increment(inverseDirection);
      // falthrough
    case goog.events.KeyCodes.DELETE:
      this.interpreter.space.set(this.cursor, befunge.Space.EMPTY_VALUE);

      this.resetCursorBlinkTimer_();
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
        this.resetCursorBlinkTimer_();
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
befunge.Renderer.prototype.moveCursor_ = function(deltaX, deltaY) {
  this.cursor.increment(new befunge.Coord([deltaX, deltaY]));
  this.resetCursorBlinkTimer_();
  this.render();
};


befunge.Renderer.prototype.resetCursorBlinkTimer_ = function() {
  this.cursorBlink = true;
  this.cursorBlinkTimer.stop();
  this.cursorBlinkTimer.start();
};
