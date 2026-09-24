// types
import { TPoint } from 'types/canvas';

const FLOATS_PER_QUAD = 12;

export const getRingVertices = (outerPoints: TPoint[], innerPoints: TPoint[]): number[] => {
  const pointCount = outerPoints.length;
  const vertices = new Array<number>(pointCount * FLOATS_PER_QUAD);

  for (let index = 0; index < pointCount; index += 1) {
    const nextIndex = (index + 1) % pointCount;
    const outer = outerPoints[index];
    const outerNext = outerPoints[nextIndex];
    const innerNext = innerPoints[nextIndex];
    const inner = innerPoints[index];
    const offset = index * FLOATS_PER_QUAD;

    vertices[offset] = outer.x;
    vertices[offset + 1] = outer.y;
    vertices[offset + 2] = outerNext.x;
    vertices[offset + 3] = outerNext.y;
    vertices[offset + 4] = innerNext.x;
    vertices[offset + 5] = innerNext.y;
    vertices[offset + 6] = outer.x;
    vertices[offset + 7] = outer.y;
    vertices[offset + 8] = innerNext.x;
    vertices[offset + 9] = innerNext.y;
    vertices[offset + 10] = inner.x;
    vertices[offset + 11] = inner.y;
  }

  return vertices;
};
