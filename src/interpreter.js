goog.provide('befunge.Interpreter');

goog.require('befunge.Coord');
goog.require('befunge.EventType');
goog.require('befunge.Space');
goog.require('befunge.ThreadEvent');
goog.require('befunge.UIHandler');
goog.require('goog.events.EventTarget');


/**
 * @constructor
 * @extends {goog.events.EventTarget}
 * @param {!befunge.UIHandler} uiHandler
 */
befunge.Interpreter = function(uiHandler) {
  goog.events.EventTarget.call(this);

  this.space = new befunge.Space();
  this.threads = [];
  this.uiHandler = uiHandler;

  this.reset();
};
goog.inherits(befunge.Interpreter, goog.events.EventTarget);


befunge.Interpreter.prototype.reset = function() {
  for (var i = 0; i < this.threads.length; ++i) {
    this.dispatchEvent(new befunge.ThreadEvent(
        befunge.EventType.THREAD_FINISHED, this.threads[i]));
  }
  this.threads = [new befunge.ThreadContext(0, this)];
};


befunge.Interpreter.prototype.run = function() {
  while (this.threads.length != 0) {
    this.step();
  }
};


befunge.Interpreter.prototype.step = function() {
  if (this.threads.length == 0) {
    this.reset();
  }

  for (var i = this.threads.length - 1; i >= 0; --i) {
    if (!this.stepThread(i)) {
      this.dispatchEvent(new befunge.ThreadEvent(
          befunge.EventType.THREAD_FINISHED, this.threads[i]));
      this.threads.splice(i, 1);
    }
  }
};


/**
 * @param {number} threadIndex
 */
befunge.Interpreter.prototype.stepThread = function(threadIndex) {
  var thread = this.threads[threadIndex];
  var instruction = this.space.get(thread.position);

  if (!this.exec(thread, instruction)) {
    return false;
  }

  this.advanceSkippingWhitespace(thread);
  return true;
};


/**
 * @param {!befunge.ThreadContext} thread
 * @param {number} instruction
 */
befunge.Interpreter.prototype.exec = function(thread, instruction) {
  var c = function(str) { return str.charCodeAt(0); }

  if (thread.stringMode && instruction != c('"')) {
    thread.push(instruction);
    return true;
  }

  if (instruction >= c('0') && instruction <= c('9')) {
    thread.push(instruction - c('0'));
    return true;
  }

  switch (instruction) {
    case c('+'): thread.push(thread.pop() + thread.pop()); break;
    case c('*'): thread.push(thread.pop() * thread.pop()); break;
    case c('-'):
      var a = thread.pop();
      var b = thread.pop();
      thread.push(b - a);
      break;
    case c('/'):
      var a = thread.pop();
      var b = thread.pop();
      thread.push(Math.floor(b / a));
      break;
    case c('%'):
      var a = thread.pop();
      var b = thread.pop();
      thread.push(b % a);
      break;
    case c('!'):
      thread.push(thread.pop() == 0 ? 1 : 0);
      break;
    case c('`'):
      thread.push(thread.pop() < thread.pop() ? 1 : 0);
      break;
    case c('>'):
      thread.direction.setArray([1]);
      break;
    case c('<'):
      thread.direction.setArray([-1]);
      break;
    case c('^'):
      thread.direction.setArray([0, -1]);
      break;
    case c('v'):
      thread.direction.setArray([0, 1]);
      break;
    case c('?'):
      switch (Math.floor(Math.random() * 4)) {
        case 0: this.exec(thread, c('<')); break;
        case 1: this.exec(thread, c('>')); break;
        case 2: this.exec(thread, c('^')); break;
        case 3: this.exec(thread, c('v')); break;
      }
      break;
    case c('_'):
      if (thread.pop() == 0) {
        this.exec(thread, c('>'));
      } else {
        this.exec(thread, c('<'));
      }
      break;
    case c('|'):
      if (thread.pop() == 0) {
        this.exec(thread, c('v'));
      } else {
        this.exec(thread, c('^'));
      }
      break;
    case c('"'):
      thread.stringMode = !thread.stringMode;
      break;
    case c(':'):
      var v = thread.pop();
      thread.push(v);
      thread.push(v);
      break;
    case c('\\'):
      var a = thread.pop();
      var b = thread.pop();
      thread.push(a);
      thread.push(b);
      break;
    case c('$'):
      thread.pop();
      break;
    case c('.'):
      this.uiHandler.outputNumber(thread.pop());
      break;
    case c(','):
      this.uiHandler.outputChar(String.fromCharCode(thread.pop()));
      break;
    case c('#'):
      this.advanceSkippingWhitespace(thread);
      break;
    case c('p'):
      var x = thread.pop();
      var y = thread.pop();
      var v = thread.pop();
      this.space.set(new befunge.Coord([x, y]), v);
      break;
    case c('g'):
      var x = thread.pop();
      var y = thread.pop();
      thread.push(this.space.get(new befunge.Coord([x, y])));
      break;
    case c('&'):
      thread.push(this.uiHandler.getNumber());
      break;
    case c('~'):
      thread.push(this.uiHandler.getChar().charCodeAt(0));
      break;
    case c('@'):
      return false;
    case c('r'):
      thread.direction.multiplyScalar(-1);
      break;
    case c('t'):
      var newThread = thread.clone(this.threads.length);
      newThread.direction.multiplyScalar(-1);
      newThread.position.increment(newThread.direction);
      this.threads.push(newThread);
      this.dispatchEvent(new befunge.ThreadEvent(
          befunge.EventType.THREAD_STARTED, newThread));
      break;
  }

  return true;
};


/**
 * @param {!befunge.ThreadContext} thread
 */
befunge.Interpreter.prototype.advanceSkippingWhitespace = function(thread) {
  var startingPosition = thread.position.clone();

  while (true) {
    // Increment the position.
    thread.position.increment(thread.direction);

    // Wrap the position if it's out of bounds.
    this.space.maybeWrapCoord(thread.position, thread.direction);

    // Is there a value here?
    if (thread.stringMode ||
        this.space.get(thread.position) != befunge.Space.EMPTY_VALUE) {
      break;
    }

    // Did we come back to where we started?
    if (thread.position.isEqual(startingPosition)) {
      break;
    }
  }

  this.dispatchEvent(new befunge.ThreadEvent(
      befunge.EventType.THREAD_POSITION_CHANGED, thread));
};
