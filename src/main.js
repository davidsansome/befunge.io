goog.provide('befunge.main');

goog.require('befunge.HTMLUIHandler');
goog.require('befunge.Interpreter');
goog.require('befunge.Renderer');
goog.require('befunge.EventType');
goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.events');
goog.require('goog.events.EventType');

goog.events.listen(window, goog.events.EventType.LOAD, function() {
  var uiHandler = new befunge.HTMLUIHandler('console');
  var interpreter = new befunge.Interpreter(uiHandler);
  var renderer = new befunge.Renderer('view', interpreter);

  goog.events.listen(
      document.getElementById('run'),
      goog.events.EventType.CLICK,
      function() {
        interpreter.reset();
        interpreter.run();
        renderer.render();
      });
  goog.events.listen(
      document.getElementById('step'),
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
    var view = document.getElementById('view');
    view.width = view.offsetWidth;
    view.height = view.offsetHeight;
    renderer.sizeChanged();
  }
  resizeCanvas();

  goog.events.listen(window, goog.events.EventType.RESIZE, resizeCanvas);
});
