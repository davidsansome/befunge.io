goog.provide('befunge.Coord');

goog.require('goog.array');


/**
 * @constructor
 * @export
 * @param {Array.<number>=} opt_value
 */
befunge.Coord = function(opt_value) {
  if (opt_value) {
    this.setArray(opt_value);
  } else {
    this.value_ = [];
  }
};


/**
 * @private
 */
befunge.Coord.prototype.normalise_ = function() {
  while (this.value_.length > 0 && this.value_[this.value_.length-1] == 0) {
    this.value_.pop();
  }
};


/**
 * @return {!Array.<number>}
 */
befunge.Coord.prototype.asNormalisedArray = function() {
  return this.value_;
};


/**
 * @return {number}
 */
befunge.Coord.prototype.length = function() {
  return this.value_.length;
};


/**
 * @param {!Array.<number>} newValue
 */
befunge.Coord.prototype.setArray = function(newValue) {
  this.value_ = goog.array.clone(newValue);
  this.normalise_();
};


/**
 * @param {number} axis
 * @return number
 */
befunge.Coord.prototype.get = function(axis) {
  return this.value_[axis] || 0;
};


/**
 * @param {number} axis
 * @param {number} value
 */
befunge.Coord.prototype.set = function(axis, value) {
  while (axis >= this.value_.length) {
    this.value_.push(0);
  }

  this.value_[axis] = value;
  this.normalise_();
};


/**
 * @param {!befunge.Coord} delta
 */
befunge.Coord.prototype.increment = function(delta) {
  var deltaValue = delta.asNormalisedArray();
  for (var i = 0; i < deltaValue.length; ++i) {
    if (i >= this.value_.length) {
      this.value_[i] = deltaValue[i];
    } else {
      this.value_[i] += deltaValue[i];
    }
  }
  this.normalise_();
};


/**
 * @param {!befunge.Coord} other
 */
befunge.Coord.prototype.multiplyCoord = function(other) {
  var length = Math.min(this.value_.length, other.value_.length);
  for (var i = 0 ; i < length; ++i) {
    this.value_[i] *= other.value_[i];
  }
};


/**
 * @param {number} scalar
 */
befunge.Coord.prototype.multiplyScalar = function(scalar) {
  for (var i = 0 ; i < this.value_.length; ++i) {
    this.value_[i] *= scalar;
  }
};


/**
 * @return {!befunge.Coord}
 */
befunge.Coord.prototype.clone = function() {
  return new befunge.Coord(this.value_);
};


/**
 * @param {!befunge.Coord} other
 * @return {boolean}
 */
befunge.Coord.prototype.isEqual = function(other) {
  return goog.array.equals(this.value_, other.value_);
};
