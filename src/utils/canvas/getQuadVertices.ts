export const getQuadVertices = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number,
): number[] => [x1, y1, x2, y2, x3, y3, x1, y1, x3, y3, x4, y4];
