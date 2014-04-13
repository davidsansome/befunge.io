goog.provide('befunge.GeometryFont');
goog.provide('befunge.GeometryFont.create');


befunge.GeometryFont = function(data, gl) {
  this.gl = gl;
  this.vertexBuffers = [];
  this.triangleCounts = [];

  for (var i = 0; i < data.length; ++i) {
    var buffer = gl.createBuffer();
    gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
        this.gl.ARRAY_BUFFER, new Float32Array(data[i]), this.gl.STATIC_DRAW);
    this.vertexBuffers.push(buffer);
    this.triangleCounts.push(Math.floor(data[i].length / 3));
  }
};


befunge.GeometryFont.create = function(font) {
  var biggestBoundingBox = new THREE.Box3;

  var geometries = [];
  for (var i = 0; i < 256; ++i) {
    if (i == 32) {
      geometries.push(null);
      continue;
    }

    var geometry = new THREE.TextGeometry(String.fromCharCode(i), {
      'size': 1,
      'height': 1,
      'font': font,
      'curveSegments': 1
    });

    geometry.computeBoundingBox();
    biggestBoundingBox.union(geometry.boundingBox);

    geometries.push(geometry);
  }

  var extent = Math.max(biggestBoundingBox.size().x,
                        biggestBoundingBox.size().y,
                        biggestBoundingBox.size().z);
  var globalOffset = biggestBoundingBox.min.clone().negate();

  var ret = [];
  for (var i = 0; i < 256; ++i) {
    if (geometries[i] == null) {
      ret.push([]);
      continue;
    }

    var offset = globalOffset.clone()
        .add(new THREE.Vector3(
            (biggestBoundingBox.size().x -
             geometries[i].boundingBox.size().x) / 2,
            0.0, 0.0));

    var faces = geometries[i].faces;
    var vertices = geometries[i].vertices;
    var data = [];
    for (var j = 0; j < faces.length; ++j) {
      var face = faces[j];

      // Only include front faces.
      if (vertices[face.a].z != 0 ||
          vertices[face.b].z != 0 ||
          vertices[face.c].z != 0) {
        continue;
      }

      data.push((vertices[face.a].x + offset.x) / extent,
                (vertices[face.a].y + offset.y) / extent,
                (vertices[face.a].z + offset.z) / extent,

                (vertices[face.b].x + offset.x) / extent,
                (vertices[face.b].y + offset.y) / extent,
                (vertices[face.b].z + offset.z) / extent,

                (vertices[face.c].x + offset.x) / extent,
                (vertices[face.c].y + offset.y) / extent,
                (vertices[face.c].z + offset.z) / extent);
    }
    ret.push(data);
  }
  return ret;
};


befunge.GeometryFont.prototype.destroy = function() {
  for (var i = 0; i < this.vertexBuffers.length; ++i) {
    this.gl.destroyBuffer(this.vertexBuffers[i]);
  }
  this.gl = null;
  this.vertexBuffers = null;
};
