goog.provide('befunge.Interpreter');

goog.require('befunge.Coord');
goog.require('befunge.Space');
goog.require('befunge.UIHandler');


/**
 * @constructor
 */
befunge.ThreadContext = function() {
  this.position = new befunge.Coord();
  this.direction = new befunge.Coord([1]);
  this.stackStack = [[]];
  this.stringMode = false;
};


befunge.ThreadContext.prototype.pop = function() {
  if (this.stackStack[0].length == 0) {
    return 0;
  }
  return this.stackStack[0].pop();
};


befunge.ThreadContext.prototype.push = function(value) {
  return this.stackStack[0].push(value);
};


/**
 * @constructor
 * @param {!befunge.UIHandler} uiHandler
 */
befunge.Interpreter = function(uiHandler) {
  this.space = new befunge.Space();
  this.threads = [new befunge.ThreadContext()];
  this.uiHandler = uiHandler;
};


befunge.Interpreter.prototype.run = function() {
  while (this.threads.length != 0) {
    for (var i = 0; i < this.threads.length; ++i) {
      if (!this.stepThread(i)) {
        console.log('Thread ' + i + ' finished');
        this.threads.splice(i, 1);
        i --;
      }
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
    if (this.space.get(thread.position) != befunge.Space.EMPTY_VALUE) {
      break;
    }
    
    // Did we come back to where we started?
    if (thread.position.isEqual(startingPosition)) {
      break;
    }
  }
};

