goog.provide('befunge.Font2Texture');

goog.require('goog.dom');


befunge.Font2Texture = function(charSize, font, color, gl) {
  var totalSize = charSize * befunge.Font2Texture.CHARS;

  this.canvas = goog.dom.createDom('canvas', {
    'width': totalSize,
    'height': totalSize,
    'style': 'display: none'
  });
  document.body.appendChild(this.canvas);

  var ctx = this.canvas.getContext('2d');
  ctx.font = font;
  ctx.textBaseline = 'top';
  ctx.fillStyle = color;

  for (var i = 0; i < 256; ++i) {
    var x = i % befunge.Font2Texture.CHARS;
    var y = Math.floor(i / befunge.Font2Texture.CHARS);

    ctx.fillText(String.fromCharCode(i), x * charSize, y * charSize);
  }

  this.gl = gl;
  this.texture = this.gl.createTexture();

  this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
  this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA,
                     this.gl.UNSIGNED_BYTE, this.canvas);
  this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER,
                        this.gl.LINEAR);
  this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER,
                        this.gl.LINEAR_MIPMAP_NEAREST);
  this.gl.generateMipmap(this.gl.TEXTURE_2D);

  this.gl.bindTexture(this.gl.TEXTURE_2D, null);

  this.texCoordSize = 1.0 / befunge.Font2Texture.CHARS;
};


befunge.Font2Texture.CHARS = 16;
befunge.Font2Texture.TEX_COORD_CHAR_SIZE = 1.0 / 16;


befunge.Font2Texture.prototype.destroy = function() {
  document.body.removeChild(this.canvas);
  this.gl.deleteTexture(this.texture);

  this.canvas = null;
  this.gl = null;
  this.texture = null;
};


befunge.Font2Texture.prototype.texCoords = function(charCode) {
  var x = charCode % befunge.Font2Texture.CHARS;
  var y = Math.floor(charCode / befunge.Font2Texture.CHARS);

  return [
    x * befunge.Font2Texture.TEX_COORD_CHAR_SIZE,
    (x + 1) * befunge.Font2Texture.TEX_COORD_CHAR_SIZE,
    y * befunge.Font2Texture.TEX_COORD_CHAR_SIZE,
    (y + 1) * befunge.Font2Texture.TEX_COORD_CHAR_SIZE
  ];
};

