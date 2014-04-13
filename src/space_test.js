goog.require('befunge.Coord');
goog.require('befunge.Space');
goog.require('goog.testing.jsunit');

var space = null;


function setUp() {
  space = new befunge.Space();
}


function testSetGet() {
  var c = new befunge.Coord([1,2]);
  space.set(c, 42);

  assertEquals(0, goog.array.defaultCompare([1,2], c.asNormalisedArray()));
  assertEquals(42, space.get(c));
  assertEquals(1, space.getAll().length);
  assertEquals(0, goog.array.defaultCompare([1,2], space.getAll()[0]['coord']));

  c.increment(new befunge.Coord([1]));

  assertEquals(0, goog.array.defaultCompare([1,2], space.getAll()[0]['coord']));
  assertEquals(32, space.get(c));

  space.set(c, 43);
  assertEquals(43, space.get(c));
  assertEquals(2, space.getAll().length);
  assertEquals(0, goog.array.defaultCompare([1,2], space.getAll()[0]['coord']));
  assertEquals(0, goog.array.defaultCompare([2,2], space.getAll()[1]['coord']));
}
