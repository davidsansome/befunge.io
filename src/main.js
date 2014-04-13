goog.provide('befunge.main');

goog.require('befunge.EventType');
goog.require('befunge.HTMLUIHandler');
goog.require('befunge.Interpreter');
goog.require('befunge.RendererWebGL');
goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.Timer');


goog.events.listen(window, goog.events.EventType.LOAD, function() {
  var uiHandler = new befunge.HTMLUIHandler('console');
  var interpreter = new befunge.Interpreter(uiHandler);
  var renderer = new befunge.RendererWebGL('view', interpreter);
  var delayElement = goog.dom.getElement('delay');

  befunge.main.runTimer = new goog.Timer;
  goog.events.listen(befunge.main.runTimer, goog.Timer.TICK, function() {
    interpreter.step();
    renderer.render();
  });

  goog.events.listen(
      goog.dom.getElement('run'),
      goog.events.EventType.CLICK,
      function() {
        interpreter.reset();
        befunge.main.runTimer.setInterval(parseInt(delayElement.value, 10));
        befunge.main.runTimer.start();
      });

  goog.events.listen(
      goog.dom.getElement('stop'),
      goog.events.EventType.CLICK,
      function() {
        befunge.main.runTimer.stop();
      });

  goog.events.listen(
      goog.dom.getElement('step'),
      goog.events.EventType.CLICK,
      function() {
        interpreter.step();
        renderer.render();
      });

  goog.events.listen(
      interpreter,
      befunge.EventType.THREAD_STACK_POP,
      function(e) {
        var header = document.getElementsByClassName('stack-header')[0];
        var entry = header.nextElementSibling;
        if (entry != null) {
          entry.remove();
        }
      });

  goog.events.listen(
      interpreter,
      befunge.EventType.THREAD_STACK_PUSH,
      function(e) {
        var stack = e.context.stackStack[0];
        var value = stack[stack.length - 1];
        var entry = goog.dom.createDom('tr', 'stack-entry stack-entry-new',
          goog.dom.createDom('td', null, value.toString(10)),
          goog.dom.createDom('td', null, value.toString(16)),
          goog.dom.createDom('td', null, String.fromCharCode(value)));
        var header = document.getElementsByClassName('stack-header')[0];
        header.parentNode.insertBefore(entry, header.nextSibling);

        window.requestAnimationFrame(function () {
          goog.dom.classlist.remove(entry, 'stack-entry-new');
        });
      });

  function resizeCanvas() {
    var view = goog.dom.getElement('view');
    view.width = view.offsetWidth;
    view.height = view.offsetHeight;
    renderer.sizeChanged();
  }
  resizeCanvas();

  goog.events.listen(window, goog.events.EventType.RESIZE, resizeCanvas);
});
