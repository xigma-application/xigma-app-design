export const translateGlyphVertices = (vertices: Float32Array, dx: number, dy: number): Float32Array => {
  const translated = new Float32Array(vertices.length);

  for (let i = 0; i < vertices.length; i += 4) {
    translated[i] = vertices[i] + dx;
    translated[i + 1] = vertices[i + 1] + dy;
    translated[i + 2] = vertices[i + 2];
    translated[i + 3] = vertices[i + 3];
  }

  return translated;
};
