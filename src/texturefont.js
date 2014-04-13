goog.provide('befunge.TextureFont');

goog.require('goog.dom');


befunge.TextureFont = function(charSize, font, color, gl) {
  var totalSize = charSize * befunge.TextureFont.CHARS;

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
    var x = i % befunge.TextureFont.CHARS;
    var y = Math.floor(i / befunge.TextureFont.CHARS);

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

  this.texCoordSize = 1.0 / befunge.TextureFont.CHARS;
};


befunge.TextureFont.CHARS = 16;
befunge.TextureFont.TEX_COORD_CHAR_SIZE = 1.0 / 16;


befunge.TextureFont.prototype.destroy = function() {
  document.body.removeChild(this.canvas);
  this.gl.deleteTexture(this.texture);

  this.canvas = null;
  this.gl = null;
  this.texture = null;
};


befunge.TextureFont.prototype.texCoords = function(charCode) {
  var x = charCode % befunge.TextureFont.CHARS;
  var y = Math.floor(charCode / befunge.TextureFont.CHARS);

  return [
    x * befunge.TextureFont.TEX_COORD_CHAR_SIZE,
    (x + 1) * befunge.TextureFont.TEX_COORD_CHAR_SIZE,
    y * befunge.TextureFont.TEX_COORD_CHAR_SIZE,
    (y + 1) * befunge.TextureFont.TEX_COORD_CHAR_SIZE
  ];
};

