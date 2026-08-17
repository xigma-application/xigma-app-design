// types
import { TPoint } from 'types/canvas';

export const getVertexAngles = (vertices: TPoint[]): number[] =>
  vertices.map((vertex, index) => {
    const previous = vertices[(index - 1 + vertices.length) % vertices.length];
    const next = vertices[(index + 1) % vertices.length];
    const toPrevious = { x: previous.x - vertex.x, y: previous.y - vertex.y };
    const toNext = { x: next.x - vertex.x, y: next.y - vertex.y };
    const dot = toPrevious.x * toNext.x + toPrevious.y * toNext.y;
    const magnitudes = Math.hypot(toPrevious.x, toPrevious.y) * Math.hypot(toNext.x, toNext.y);

    return Math.acos(dot / magnitudes);
  });
