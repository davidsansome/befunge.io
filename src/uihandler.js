goog.provide('befunge.UIHandler');
goog.provide('befunge.DebugUIHandler');


/**
 * @constructor
 */
befunge.UIHandler = function() {};


/**
 * @param {number} number
 */
befunge.UIHandler.prototype.outputNumber = function(number) {
  throw "Not implemented";
};


/**
 * @param {string} char
 */
befunge.UIHandler.prototype.outputChar = function(char) {
  throw "Not implemented";
};


/**
 * @return number
 */
befunge.UIHandler.prototype.getNumber = function() {
  throw "Not implemented";
};


/**
 * @return string
 */
befunge.UIHandler.prototype.getChar = function() {
  throw "Not implemented";
};


/**
 * @constructor
 * @extends {befunge.UIHandler}
 */
befunge.DebugUIHandler = function() {};


/**
 * @param {number} number
 */
befunge.DebugUIHandler.prototype.outputNumber = function(number) {
  console.log(number);
};


/**
 * @param {string} char
 */
befunge.DebugUIHandler.prototype.outputChar = function(char) {
  console.log(char);
};


/**
 * @return number
 */
befunge.DebugUIHandler.prototype.getNumber = function() {
  while (true) {
    var v = parseInt(window.prompt('Enter a number', ''), 10);
    if (!isNaN(v)) {
      return v;
    }
  }
};


/**
 * @return string
 */
befunge.DebugUIHandler.prototype.getChar = function() {
  while (true) {
    var v = window.prompt('Enter a character', '');
    if (v.length != 0) {
      return v.charCodeAt(0);
    }
  }
};
