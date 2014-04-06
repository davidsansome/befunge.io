goog.provide('befunge.ThreadContext');

goog.require('befunge.Coord');
goog.require('goog.array');


/**
 * @constructor
 */
befunge.ThreadContext = function(id) {
  this.id = id;
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
 * @param {number} newId
 * @return {!befunge.ThreadContext}
 */
befunge.ThreadContext.prototype.clone = function(newId) {
  var ret = new befunge.ThreadContext(newId);
  ret.position = this.position.clone();
  ret.direction = this.direction.clone();
  ret.stringMode = this.stringMode;

  for (var i = 0; i < this.stackStack.length; ++i) {
    ret.stackStack.push(goog.array.clone(this.stackStack[i]));
  }
  return ret;
};
