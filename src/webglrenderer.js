goog.provide('befunge.WebGLRenderer');

goog.require('befunge.Font2Texture');
goog.require('befunge.Renderer');


befunge.WebGLRenderer = function(containerId, interpreter) {
  this.container = document.getElementById(containerId);
  this.interpreter = interpreter;

  this.cursor = new befunge.Coord();
  this.textDirection = new befunge.Coord([1]);
  this.threadCursors = {};

  interpreter.space.writeLine(new befunge.Coord(), '1...@');

  this.gl = WebGLDebugUtils.makeDebugContext(
      this.container.getContext("webgl"));
  this.font = new befunge.Font2Texture(
      32, 'bold 32px courier', '#0F0', this.gl);

  // Initialise shaders.
  var shaderProgram = this.gl.createProgram();
  this.gl.attachShader(shaderProgram, this.loadShader_('shader-vert'));
  this.gl.attachShader(shaderProgram, this.loadShader_('shader-frag'));
  this.gl.linkProgram(shaderProgram);
  this.gl.useProgram(shaderProgram);

  this.vertexPositionAttrib =
      this.gl.getAttribLocation(shaderProgram, 'vertex_position');
  this.vertexTexCoordAttrib =
      this.gl.getAttribLocation(shaderProgram, 'vertex_texcoord');
  this.projectionUniform =
      this.gl.getUniformLocation(shaderProgram, 'projection_matrix');
  this.modelViewUniform =
      this.gl.getUniformLocation(shaderProgram, 'modelview_matrix');
  this.fontSamplerUniform =
      this.gl.getUniformLocation(shaderProgram, 'font_sampler')

  this.gl.enableVertexAttribArray(this.vertexPositionAttrib);
  this.gl.enableVertexAttribArray(this.vertexTexCoordAttrib);

  // Initialise buffers.
  this.vertexBuffer = this.gl.createBuffer();
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
  this.gl.vertexAttribPointer(
      this.vertexPositionAttrib, 3, this.gl.FLOAT, false, 0, 0);

  this.texCoordBuffer = this.gl.createBuffer();
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
  this.gl.vertexAttribPointer(
      this.vertexTexCoordAttrib, 2, this.gl.FLOAT, false, 0, 0);
};


befunge.WebGLRenderer.prototype.loadShader_ = function(id) {
  var element = document.getElementById(id);
  var source = element.firstChild.nodeValue;
  var shader;

  if (element.type == "x-shader/x-fragment") {
    shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
  } else if (element.type == "x-shader/x-vertex") {
    shader = this.gl.createShader(this.gl.VERTEX_SHADER);
  } else {
    throw "Unknown shader type " + element.type;
  }

  this.gl.shaderSource(shader, source);
  this.gl.compileShader(shader);

  if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
    throw "Failed to compile shader: " + this.gl.getShaderInfoLog(shader);
  }

  return shader;
};


befunge.WebGLRenderer.prototype.sizeChanged = function() {
  var widthPx = this.gl.canvas.width;
  var heightPx = this.gl.canvas.height;

  this.width = widthPx / befunge.Renderer.FONT_SIZE;
  this.height = heightPx / befunge.Renderer.FONT_SIZE;

  this.gl.viewport(0, 0, widthPx, heightPx);
  this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

  this.gl.enable(this.gl.DEPTH_TEST);
  this.gl.depthFunc(this.gl.LEQUAL);

  this.gl.enable(this.gl.BLEND);
  this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

  // Initialise matrices.
  this.projection = makePerspective(50, widthPx / heightPx, 0.1, 100.0);
  this.modelView = Matrix.I(4)
      .x(Matrix.Translation($V([0, 0, -80.0])).ensure4x4());

  this.render();
};


befunge.WebGLRenderer.prototype.render = function() {
  // The number of characters on each side of the cursor to draw.
  var charsInView = {
    'x': Math.ceil(this.width / 2),
    'y': Math.ceil(this.height / 2)
  };

  var viewBounds = {
    'x1': this.cursor.get(0) - charsInView['x'],
    'y1': this.cursor.get(1) - charsInView['y'],
    'x2': this.cursor.get(0) + charsInView['x'] + 1,
    'y2': this.cursor.get(1) + charsInView['y'] + 1,
  };

  // The character in the top-left of the view.  May only be partially inside
  // the bounding box.
  var topLeftCoord = this.cursor.clone();
  topLeftCoord.set(0, topLeftCoord.get(0) - charsInView['x']);
  topLeftCoord.set(1, topLeftCoord.get(1) - charsInView['y']);

  // Read the data from the funge space.
  var plane = this.interpreter.space.readPlane(
      topLeftCoord,
      [charsInView['x'] * 2 + 1,
       charsInView['y'] * 2 + 1]);

  // Translate such that the top-left corner of plane[0][0] is at 0,0.
  // TODO.

  // Draw the characters in the funge space.
  var vertices = [];
  var texCoords = [];

  for (var y = 0; y < plane.length; ++y) {
    var line = plane[y];

    for (var x = 0; x < line.length; ++x) {
      var v = line[x];
      if (v == befunge.Space.EMPTY_VALUE) {
        continue;
      }

      vertices.push(
          x,     y,     0.0,
          x + 1, y,     0.0,
          x,     y + 1, 0.0,

          x,     y + 1, 0.0,
          x + 1, y + 1, 0.0,
          x + 1, y,     0.0
      );

      var charTexCoords = this.font.texCoords(v);
      texCoords.push(
          charTexCoords[0], charTexCoords[3],
          charTexCoords[1], charTexCoords[3],
          charTexCoords[0], charTexCoords[2],

          charTexCoords[0], charTexCoords[2],
          charTexCoords[1], charTexCoords[2],
          charTexCoords[1], charTexCoords[3]
      );
    }
  }

  // Clear the entire canvas.
  this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

  // Setup matrices.
  this.gl.uniformMatrix4fv(this.modelViewUniform, false,
                      new Float32Array(this.modelView.flatten()));
  this.gl.uniformMatrix4fv(this.projectionUniform, false,
                      new Float32Array(this.projection.flatten()));

  // Bind textures.
  this.gl.activeTexture(this.gl.TEXTURE0);
  this.gl.bindTexture(this.gl.TEXTURE_2D, this.font.texture);
  this.gl.uniform1i(this.fontSamplerUniform, 0);

  // Draw everything.
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
  this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices),
                     this.gl.STATIC_DRAW);
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
  this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(texCoords),
                     this.gl.STATIC_DRAW);

  this.gl.drawArrays(this.gl.TRIANGLES, 0, Math.floor(vertices.length / 3));
};
