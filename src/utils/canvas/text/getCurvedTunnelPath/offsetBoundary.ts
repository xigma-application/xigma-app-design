// types
import { TPoint } from 'types/canvas';

// utils
import { addPoint } from './addPoint';
import { getPolylineSegmentOffset } from '../../vectorNetwork/getPolylineSegmentOffset';
import { intersectOffsetLines } from './intersectOffsetLines';

const dot = (a: TPoint, b: TPoint): number => a.x * b.x + a.y * b.y;
const subtract = (a: TPoint, b: TPoint): TPoint => ({ x: a.x - b.x, y: a.y - b.y });

export const offsetBoundary = (centerline: TPoint[], width: number): TPoint[] => {
  const offsets = centerline.slice(0, -1).map((point, index) => getPolylineSegmentOffset(point, centerline[index + 1], width) as TPoint);
  const boundary: TPoint[] = [addPoint(centerline[0], offsets[0])];
  let trim: { direction: TPoint; miter: TPoint } | null = null;

  for (let index = 1; index < centerline.length - 1; index += 1) {
    const vertex = centerline[index];
    const previousEnd = addPoint(vertex, offsets[index - 1]);
    const nextStart = addPoint(vertex, offsets[index]);
    const previousDirection = { x: vertex.x - centerline[index - 1].x, y: vertex.y - centerline[index - 1].y };
    const nextDirection = { x: centerline[index + 1].x - vertex.x, y: centerline[index + 1].y - vertex.y };
    const miter = intersectOffsetLines(previousEnd, previousDirection, nextStart, nextDirection);

    if (miter) {
      for (let i = boundary.length - 1; i >= 0 && dot(subtract(boundary[i], miter), previousDirection) > 0; i -= 1) {
        boundary[i] = miter;
      }

      boundary.push(miter, miter);
      trim = { direction: nextDirection, miter };
      continue;
    }

    if (trim && dot(subtract(nextStart, trim.miter), trim.direction) < 0) {
      boundary.push(trim.miter, trim.miter);
      continue;
    }

    trim = null;
    boundary.push(previousEnd, nextStart);
  }

  const last = addPoint(centerline[centerline.length - 1], offsets[offsets.length - 1]);
  boundary.push(trim && dot(subtract(last, trim.miter), trim.direction) < 0 ? trim.miter : last);

  return boundary;
};
