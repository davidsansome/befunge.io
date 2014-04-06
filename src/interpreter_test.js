goog.require('befunge.Interpreter');
goog.require('befunge.UIHandler');
goog.require('goog.testing.jsunit');

/**
 * @constructor
 * @extends {befunge.UIHandler}
 */
FakeUIHandler = function() {
  this.output = '';
  this.numbers = [];
  this.chars = [];
};


/**
 * @param {number} number
 */
FakeUIHandler.prototype.outputNumber = function(number) {
  this.output += number;
};


/**
 * @param {string} char
 */
FakeUIHandler.prototype.outputChar = function(char) {
  this.output += char;
};


/**
 * @return number
 */
FakeUIHandler.prototype.getNumber = function() {
  return this.numbers.pop();
};


/**
 * @return string
 */
FakeUIHandler.prototype.getChar = function() {
  return this.chars.pop();
};


var uiHandler = null;
var interpreter = null;


function setUp() {
  uiHandler = new FakeUIHandler();
  interpreter = new befunge.Interpreter(uiHandler);
}


function testPopEmpty() {
  interpreter.space.writeLine(new befunge.Coord(), '1...@');
  interpreter.run();

  assertEquals('100', uiHandler.output);
}


function testAddition() {
  interpreter.space.writeLine(new befunge.Coord(), '35+.@');
  interpreter.run();

  assertEquals('8', uiHandler.output);
}


function testSubtraction() {
  interpreter.space.writeLine(new befunge.Coord(), '53-.@');
  interpreter.run();

  assertEquals('2', uiHandler.output);
}


function testSubtractionNegative() {
  interpreter.space.writeLine(new befunge.Coord(), '35-.@');
  interpreter.run();

  assertEquals('-2', uiHandler.output);
}


function testMultiplication() {
  interpreter.space.writeLine(new befunge.Coord(), '35*.@');
  interpreter.run();

  assertEquals('15', uiHandler.output);
}


function testDivision() {
  interpreter.space.writeLine(new befunge.Coord(), '82/.@');
  interpreter.run();

  assertEquals('4', uiHandler.output);
}


function testDivisionFloor() {
  interpreter.space.writeLine(new befunge.Coord(), '83/.@');
  interpreter.run();

  assertEquals('2', uiHandler.output);
}


function testModulo() {
  interpreter.space.writeLine(new befunge.Coord(), '83%.@');
  interpreter.run();

  assertEquals('2', uiHandler.output);
}


function testNotTrue() {
  interpreter.space.writeLine(new befunge.Coord(), '7!.@');
  interpreter.run();

  assertEquals('0', uiHandler.output);
}


function testNotFalse() {
  interpreter.space.writeLine(new befunge.Coord(), '0!.@');
  interpreter.run();

  assertEquals('1', uiHandler.output);
}


function testNotNegative() {
  interpreter.space.writeLine(new befunge.Coord(), '07-!.@');
  interpreter.run();

  assertEquals('0', uiHandler.output);
}


function testGreaterThanTrue() {
  interpreter.space.writeLine(new befunge.Coord(), '12`.@');
  interpreter.run();

  assertEquals('0', uiHandler.output);
}


function testGreaterThanFalse() {
  interpreter.space.writeLine(new befunge.Coord(), '21`.@');
  interpreter.run();

  assertEquals('1', uiHandler.output);
}


function testGreaterThanEqual() {
  interpreter.space.writeLine(new befunge.Coord(), '11`.@');
  interpreter.run();

  assertEquals('0', uiHandler.output);
}


function testSkip() {
  interpreter.space.writeLine(new befunge.Coord(), '12#..@');
  interpreter.run();

  assertEquals('2', uiHandler.output);
}


function testMoveRight() {
  interpreter.space.writeLine(new befunge.Coord(), '1>2..@');
  interpreter.run();

  assertEquals('21', uiHandler.output);
}


function testMoveLeft() {
  interpreter.space.writeLine(new befunge.Coord(), '12#@.3.<@');
  interpreter.run();

  assertEquals('2313', uiHandler.output);
}


function testMoveDown() {
  interpreter.space.writeLine(new befunge.Coord([0, 0]), 'v');
  interpreter.space.writeLine(new befunge.Coord([0, 1]), '1');
  interpreter.space.writeLine(new befunge.Coord([0, 2]), '.');
  interpreter.space.writeLine(new befunge.Coord([0, 3]), '@');
  interpreter.run();

  assertEquals('1', uiHandler.output);
}


function testMoveUp() {
  interpreter.space.writeLine(new befunge.Coord([0, -3]), '@');
  interpreter.space.writeLine(new befunge.Coord([0, -2]), '.');
  interpreter.space.writeLine(new befunge.Coord([0, -1]), '1');
  interpreter.space.writeLine(new befunge.Coord([0,  0]), '^');
  interpreter.run();

  assertEquals('1', uiHandler.output);
}


function testCondLeft() {
  interpreter.space.writeLine(new befunge.Coord([0, 0]), '1  v');
  interpreter.space.writeLine(new befunge.Coord([0, 1]), '@.7_8.@');
  interpreter.run();

  assertEquals('7', uiHandler.output);
}


function testCondRight() {
  interpreter.space.writeLine(new befunge.Coord([0, 0]), '0  v');
  interpreter.space.writeLine(new befunge.Coord([0, 1]), '@.7_8.@');
  interpreter.run();

  assertEquals('8', uiHandler.output);
}


function testCondUp() {
  interpreter.space.writeLine(new befunge.Coord([0, -1]), '@.7<');
  interpreter.space.writeLine(new befunge.Coord([0,  0]), '1  |');
  interpreter.space.writeLine(new befunge.Coord([0,  1]), '@.8<');
  interpreter.run();

  assertEquals('7', uiHandler.output);
}


function testCondDown() {
  interpreter.space.writeLine(new befunge.Coord([0, -1]), '@.7<');
  interpreter.space.writeLine(new befunge.Coord([0,  0]), '0  |');
  interpreter.space.writeLine(new befunge.Coord([0,  1]), '@.8<');
  interpreter.run();

  assertEquals('8', uiHandler.output);
}


function testStringMode() {
  interpreter.space.writeLine(new befunge.Coord([0, 0]), '"foo",,,@');
  interpreter.run();

  assertEquals('oof', uiHandler.output);
}


function testDuplicate() {
  interpreter.space.writeLine(new befunge.Coord([0, 0]), '1:...@');
  interpreter.run();

  assertEquals('110', uiHandler.output);
}


function testSwap() {
  interpreter.space.writeLine(new befunge.Coord([0, 0]), '12\\..@');
  interpreter.run();

  assertEquals('12', uiHandler.output);
}


function testPop() {
  interpreter.space.writeLine(new befunge.Coord([0, 0]), '1$.@');
  interpreter.run();

  assertEquals('0', uiHandler.output);
}


function testPut() {
  interpreter.space.writeLine(new befunge.Coord([0, 0]), '"7"06p .@');
  interpreter.run();

  assertEquals('7', uiHandler.output);
}


function testGet() {
  interpreter.space.writeLine(new befunge.Coord([0, 0]), '06g ,@x');
  interpreter.run();

  assertEquals('x', uiHandler.output);
}


function testInputNumber() {
  uiHandler.numbers.push(1);
  interpreter.space.writeLine(new befunge.Coord([0, 0]), '&.@');
  interpreter.run();

  assertEquals('1', uiHandler.output);
}


function testInputChar() {
  uiHandler.chars.push("a");
  interpreter.space.writeLine(new befunge.Coord([0, 0]), '~,@');
  interpreter.run();

  assertEquals('a', uiHandler.output);
}


function testReverse() {
  interpreter.space.writeLine(new befunge.Coord([0, 0]), '#vr3.@');
  interpreter.space.writeLine(new befunge.Coord([0, 1]), ' >2.@');

  interpreter.run();

  assertEquals('2', uiHandler.output);
}


function testSplit() {
  interpreter.space.writeLine(new befunge.Coord([-3, 0]), '@.1t2.@');
  interpreter.run();

  assertEquals('12', uiHandler.output);
}
