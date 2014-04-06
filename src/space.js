goog.provide('befunge.Space');

goog.require('befunge.Coord');


/**
 * @constructor
 * @export
 */
befunge.Space = function() {
  this.data_ = {};
  this.minCoord_ = new befunge.Coord();
  this.maxCoord_ = new befunge.Coord();
};


befunge.Space.EMPTY_VALUE = 32;


/**
 * @param {!befunge.Coord} coord
 * @return number
 */
befunge.Space.prototype.get = function(coord) {
  var value = this.data_[coord.asNormalisedArray()];
  if (typeof value == 'undefined') {
    return befunge.Space.EMPTY_VALUE;
  }
  return value;
};


/**
 * @param {!befunge.Coord} coord
 * @param {number} value
 */
befunge.Space.prototype.set = function(coord, value) {
  var normalisedArray = coord.asNormalisedArray();
  if (value == befunge.Space.EMPTY_VALUE) {
    delete this.data_[normalisedArray];
  } else {
    this.data_[normalisedArray] = value;
  }

  for (var i = 0; i < coord.length(); ++i) {
    if (this.minCoord_.get(i) > coord.get(i)) {
      this.minCoord_.set(i, coord.get(i));
    }
    if (this.maxCoord_.get(i) < coord.get(i)) {
      this.maxCoord_.set(i, coord.get(i));
    }
  }
};


/**
 * @param {!befunge.Coord} startCoord
 * @param {string} string
 * @param {number=} opt_dim
 */
befunge.Space.prototype.writeLine = function(startCoord, string, opt_dim) {
  var coord = startCoord.clone();

  if (typeof opt_dim == 'undefined') {
    opt_dim = 0;
  }

  var delta = new befunge.Coord();
  delta.set(opt_dim, 1);

  for (var i = 0; i < string.length; ++i) {
    this.set(coord, string.charCodeAt(i));
    coord.increment(delta);
  }
};


/**
 * @param {!befunge.Coord} startCoord
 * @param {number} length
 * @param {number=} opt_dim
 */
befunge.Space.prototype.readLine = function(startCoord, length, opt_dim) {
  var coord = startCoord.clone();

  if (typeof opt_dim == 'undefined') {
    opt_dim = 0;
  }

  var delta = new befunge.Coord();
  delta.set(opt_dim, 1);

  var ret = [];

  for (var i = 0; i < length; ++i) {
    ret.push(this.get(coord));
    coord.increment(delta);
  }

  return ret;
};


/**
 * @param {!befunge.Coord} startCoord
 * @param {!Array.<number>} size
 * @param {Array.<number>=} opt_dims
 */
befunge.Space.prototype.readPlane = function(startCoord, size, opt_dims) {
  var coord = startCoord.clone();

  if (typeof opt_dims == 'undefined') {
    opt_dims = [0, 1];
  }

  var delta = new befunge.Coord();
  delta.set(opt_dims[1], 1);

  var ret = [];

  for (var i = 0; i < size[1]; ++i) {
    ret.push(this.readLine(coord, size[0], opt_dims[0]));
    coord.increment(delta);
  }

  return ret;
};


befunge.Space.prototype.maybeWrapCoord = function(coord, vector) {
  // Find the dimension that's set.
  var dimension = null;
  var direction = null;
  for (var i = 0; i < vector.length(); ++i) {
    if (vector.get(i)) {
      dimension = i;
      direction = vector.get(dimension);
      break;
    }
  }
  if (dimension == null) {
    throw "maybeWrapCoord: empty direction";
  }

  var value = coord.get(dimension);
  if (value < this.minCoord_.get(dimension) ||
      value > this.maxCoord_.get(dimension)) {
    if (direction == 1) {
      value = this.minCoord_.get(dimension);
    } else {
      value = this.maxCoord_.get(dimension);
    }
  }

  coord.set(dimension, value);
};
