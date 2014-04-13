goog.provide('befunge.RendererWebGL');

goog.require('befunge.GeometryFont');
goog.require('befunge.Renderer');
goog.require('befunge.Shader');


befunge.RendererWebGL = function(canvasId, interpreter) {
  befunge.Renderer.call(this, canvasId, interpreter);

  interpreter.space.writeLine(new befunge.Coord(), '1...@');
  interpreter.space.writeLine(new befunge.Coord([0, 0, -1]), 'abcdef');

  this.gl = WebGLDebugUtils.makeDebugContext(
      this.canvas.getContext("webgl"));
  this.font = new befunge.GeometryFont(
      befunge.GeometryFont.inconsolata, this.gl);

  // Initialise shaders.
  this.characterShader = new befunge.Shader('char-v', 'char-f', this.gl);
  this.characterShader.use();

  this.gl.enableVertexAttribArray(
      this.characterShader.attrib('vertex_position'));

  // Initialise vertex buffers.
  this.cursorBuffer = this.gl.createBuffer();
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cursorBuffer);
  this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
    0.0, 0.0, -0.01,
    0.0, 1.0, -0.01,
    1.0, 0.0, -0.01,
    1.0, 1.0, -0.01
  ]), this.gl.STATIC_DRAW);
};
goog.inherits(befunge.RendererWebGL, befunge.Renderer);


befunge.RendererWebGL.prototype.sizeChanged = function() {
  var widthPx = this.gl.canvas.width;
  var heightPx = this.gl.canvas.height;

  this.width = widthPx / befunge.Renderer.FONT_SIZE;
  this.height = heightPx / befunge.Renderer.FONT_SIZE;
  this.scale = 250 / heightPx;

  this.gl.viewport(0, 0, widthPx, heightPx);
  this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

  this.gl.enable(this.gl.DEPTH_TEST);
  this.gl.depthFunc(this.gl.LEQUAL);

  this.gl.enable(this.gl.BLEND);
  this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

  // Initialise matrices.
  this.projection = makePerspective(50, widthPx / heightPx, 0.1, 100.0);

  this.render();
};


befunge.RendererWebGL.prototype.render = function() {
  // Look at the cursor.
  var center = this.cursor;
  var baseModelView =
      Matrix.Diagonal([this.scale, this.scale, this.scale, 1.0])
      .x(makeLookAt(
          // Camera.
          center.get(0),
          - center.get(1) + 5.0 / this.scale,
          center.get(2) + 10.0 / this.scale,

          // Center.
          center.get(0),
          - center.get(1),
          center.get(2),

          // Up vector.
          0.0,
          1.0,
          0.0));

  // Read all the data from the funge space, and sort by z coordinate.
  var data = this.interpreter.space.getAll();
  data.sort(function (first, second) {
    var firstZ = first['coord'][2] || 0;
    var secondZ = second['coord'][2] || 0;
    return firstZ < secondZ ? -1 :
           firstZ > secondZ ?  1 : 0;
  });

  // Clear the entire canvas.
  this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

  // Setup matrices.
  this.gl.uniformMatrix4fv(
      this.characterShader.uniform('projection_matrix'), false,
      new Float32Array(this.projection.flatten()));
  this.gl.uniform4fv(
      this.characterShader.uniform('color'),
      new Float32Array([0.0, 1.0, 0.0, 1.0]));

  // Draw the characters in the funge space.
  var seenCursorCharacter = false;
  for (var i = 0; i < data.length; ++i) {
    var coordArray = data[i]['coord'];
    var x = coordArray[0] || 0;
    var y = - (coordArray[1] || 0);
    var z = coordArray[2] || 0;
    var v = data[i]['value'];

    // Translate to this character.
    var modelView = baseModelView.dup().x(Matrix.Translation($V([x, y, z])));
    this.gl.uniformMatrix4fv(
        this.characterShader.uniform('modelview_matrix'), false,
        new Float32Array(modelView.flatten()));

    var thisCharIsBlinking = false;
    if (this.cursorBlink &&
        goog.array.defaultCompare(coordArray,
                                  this.cursor.asNormalisedArray()) == 0) {
      seenCursorCharacter = true;

      // Draw the cursor in green.
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cursorBuffer);
      this.gl.vertexAttribPointer(
          this.characterShader.attrib('vertex_position'),
          3, this.gl.FLOAT, false, 0, 0);
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

      // Draw the character in black.
      this.gl.uniform4fv(
          this.characterShader.uniform('color'),
          new Float32Array([0.0, 0.0, 0.0, 1.0]));

      // Set the color back to green again after.
      thisCharIsBlinking = true;
    }

    // Draw the character.
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.font.vertexBuffers[v]);
    this.gl.vertexAttribPointer(
        this.characterShader.attrib('vertex_position'),
        3, this.gl.FLOAT, false, 0, 0);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.font.triangleCounts[v]);

    if (thisCharIsBlinking) {
      // Set the color back to green.
      this.gl.uniform4fv(
          this.characterShader.uniform('color'),
          new Float32Array([0.0, 1.0, 0.0, 1.0]));
    }
  }

  // We haven't drawn the cursor yet.
  if (this.cursorBlink && !seenCursorCharacter) {
    var coordArray = this.cursor.asNormalisedArray();
    var x = coordArray[0] || 0;
    var y = - (coordArray[1] || 0);
    var z = coordArray[2] || 0;

    // Translate to this character.
    var modelView = baseModelView.dup().x(Matrix.Translation($V([x, y, z])));
    this.gl.uniformMatrix4fv(
        this.characterShader.uniform('modelview_matrix'), false,
        new Float32Array(modelView.flatten()));

    // Draw the cursor.
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cursorBuffer);
    this.gl.vertexAttribPointer(
        this.characterShader.attrib('vertex_position'),
        3, this.gl.FLOAT, false, 0, 0);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }
};
