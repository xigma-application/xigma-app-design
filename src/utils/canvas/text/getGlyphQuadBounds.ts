export type TGlyphQuadBounds = { maxX: number; maxY: number; minX: number; minY: number };

export const getGlyphQuadBounds = (vertices: Float32Array): TGlyphQuadBounds | null => {
  if (vertices.length === 0) {
    return null;
  }

  let minX = vertices[0];
  let maxX = vertices[0];
  let minY = vertices[1];
  let maxY = vertices[1];

  for (let i = 4; i < vertices.length; i += 4) {
    minX = Math.min(minX, vertices[i]);
    maxX = Math.max(maxX, vertices[i]);
    minY = Math.min(minY, vertices[i + 1]);
    maxY = Math.max(maxY, vertices[i + 1]);
  }

  return { maxX, maxY, minX, minY };
};
