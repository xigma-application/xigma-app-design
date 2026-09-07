// types
import { TDimensionHintGuides } from './types';
import { TPoint } from 'types/canvas';

// utils
import { ORIGIN } from './constants';
import { rotatePoint } from 'utils/math/rotatePoint';

export const rotateDimensionHintGuides = (guides: TDimensionHintGuides, center: TPoint, degrees: number): TDimensionHintGuides => ({
  labels: guides.labels.map((label) => ({
    ...label,
    anchor: rotatePoint(label.anchor, center, degrees),
    offsetDirection: rotatePoint(label.offsetDirection, ORIGIN, degrees),
  })),
  lines: guides.lines.map((line) => {
    const start = rotatePoint({ x: line.x1, y: line.y1 }, center, degrees);
    const end = rotatePoint({ x: line.x2, y: line.y2 }, center, degrees);

    return { ...line, x1: start.x, x2: end.x, y1: start.y, y2: end.y };
  }),
});
