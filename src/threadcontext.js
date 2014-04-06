goog.provide('befunge.ThreadContext');

goog.require('befunge.Coord');


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
