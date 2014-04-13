goog.provide('befunge.Shader');


befunge.Shader = function(vertexId, fragmentId, gl) {
  this.gl = gl;
  this.program = this.gl.createProgram();
  this.uniforms_ = {};
  this.attribs_ = {};

  gl.attachShader(this.program, this.load_(vertexId, gl.VERTEX_SHADER));
  gl.attachShader(this.program, this.load_(fragmentId, gl.FRAGMENT_SHADER));
  gl.linkProgram(this.program);
};


befunge.Shader.prototype.destroy = function() {
  this.gl.destroyProgram(this.program);
  this.program = null;
  this.gl = null;
};


befunge.Shader.prototype.use = function() {
  this.gl.useProgram(this.program);
};


befunge.Shader.prototype.uniform = function(name) {
  if (typeof this.uniforms_[name] == 'undefined') {
    this.uniforms_[name] = this.gl.getUniformLocation(this.program, name);
  }
  return this.uniforms_[name];
};


befunge.Shader.prototype.attrib = function(name) {
  if (typeof this.attribs_[name] == 'undefined') {
    this.attribs_[name] = this.gl.getAttribLocation(this.program, name);
  }
  return this.attribs_[name];
};


befunge.Shader.prototype.load_ = function(id, type) {
  var element = document.getElementById(id);
  var source = element.firstChild.nodeValue;
  var shader = this.gl.createShader(type);

  this.gl.shaderSource(shader, source);
  this.gl.compileShader(shader);

  if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
    throw "Failed to compile shader: " + this.gl.getShaderInfoLog(shader);
  }

  return shader;
};
