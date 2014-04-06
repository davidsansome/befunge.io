goog.provide('befunge.EventType');
goog.provide('befunge.ThreadEvent');

goog.require('befunge.ThreadContext');
goog.require('goog.events');
goog.require('goog.events.Event');

/**
 * @enum {string}
 */
befunge.EventType = {
  THREAD_STARTED: goog.events.getUniqueId('befunge'),
  THREAD_FINISHED: goog.events.getUniqueId('befunge'),
  THREAD_POSITION_CHANGED: goog.events.getUniqueId('befunge')
};


/**
 * @constructor
 * @extends {goog.events.Event}
 * @param {!befunge.EventType} type
 * @param {!befunge.ThreadContext} context
 */
befunge.ThreadEvent = function(type, context) {
  goog.events.Event.call(this, type);

  this.context = context;
};
goog.inherits(befunge.ThreadEvent, goog.events.Event);
