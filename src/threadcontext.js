goog.provide('befunge.ThreadContext');

goog.require('befunge.Coord');
goog.require('goog.array');


/**
 * @constructor
 */
befunge.ThreadContext = function(id, interpreter) {
  this.id = id;
  this.interpreter = interpreter;
  this.position = new befunge.Coord();
  this.direction = new befunge.Coord([1]);
  this.stackStack = [[]];
  this.stringMode = false;
};


befunge.ThreadContext.prototype.pop = function() {
  if (this.stackStack[0].length == 0) {
    return 0;
  }
  var ret = this.stackStack[0].pop();

  this.interpreter.dispatchEvent(new befunge.ThreadEvent(
      befunge.EventType.THREAD_STACK_POP, this));

  return ret;
};


befunge.ThreadContext.prototype.push = function(value) {
  this.stackStack[0].push(value);

  this.interpreter.dispatchEvent(new befunge.ThreadEvent(
      befunge.EventType.THREAD_STACK_PUSH, this));
};


/**
 * @param {number} newId
 * @return {!befunge.ThreadContext}
 */
befunge.ThreadContext.prototype.clone = function(newId) {
  var ret = new befunge.ThreadContext(newId, this.interpreter);
  ret.position = this.position.clone();
  ret.direction = this.direction.clone();
  ret.stringMode = this.stringMode;

  for (var i = 0; i < this.stackStack.length; ++i) {
    ret.stackStack.push(goog.array.clone(this.stackStack[i]));
  }
  return ret;
};
