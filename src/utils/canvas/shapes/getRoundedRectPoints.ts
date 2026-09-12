// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getCircularCornerPoints } from './getCircularCornerPoints';
import { getMaxCornerRadius } from 'utils/canvas/cornerRadius/getMaxCornerRadius';
import { getSquircleCornerPoints } from './squircle/getSquircleCornerPoints';

export type TRoundedRect = TDraftRect & {
  cornerRadius: number;
  cornerRadiusBottomLeft?: number;
  cornerRadiusBottomRight?: number;
  cornerRadiusTopLeft?: number;
  cornerRadiusTopRight?: number;
  cornerSmoothing?: number;
};

const CORNER_ARCS: {
  center: (rect: TDraftRect, radius: number) => TPoint;
  entryDir: TPoint;
  exitDir: TPoint;
  getRadius: (rect: TRoundedRect) => number | undefined;
  startAngle: number;
  vertex: (rect: TDraftRect) => TPoint;
}[] = [
  {
    center: (rect, radius) => ({ x: rect.x + radius, y: rect.y + radius }),
    entryDir: { x: 0, y: -1 },
    exitDir: { x: 1, y: 0 },
    getRadius: (rect) => rect.cornerRadiusTopLeft,
    startAngle: Math.PI,
    vertex: (rect) => ({ x: rect.x, y: rect.y }),
  },
  {
    center: (rect, radius) => ({ x: rect.x + rect.width - radius, y: rect.y + radius }),
    entryDir: { x: 1, y: 0 },
    exitDir: { x: 0, y: 1 },
    getRadius: (rect) => rect.cornerRadiusTopRight,
    startAngle: (3 * Math.PI) / 2,
    vertex: (rect) => ({ x: rect.x + rect.width, y: rect.y }),
  },
  {
    center: (rect, radius) => ({ x: rect.x + rect.width - radius, y: rect.y + rect.height - radius }),
    entryDir: { x: 0, y: 1 },
    exitDir: { x: -1, y: 0 },
    getRadius: (rect) => rect.cornerRadiusBottomRight,
    startAngle: 0,
    vertex: (rect) => ({ x: rect.x + rect.width, y: rect.y + rect.height }),
  },
  {
    center: (rect, radius) => ({ x: rect.x + radius, y: rect.y + rect.height - radius }),
    entryDir: { x: -1, y: 0 },
    exitDir: { x: 0, y: -1 },
    getRadius: (rect) => rect.cornerRadiusBottomLeft,
    startAngle: Math.PI / 2,
    vertex: (rect) => ({ x: rect.x, y: rect.y + rect.height }),
  },
];

export const getRoundedRectPoints = (rect: TRoundedRect, segmentsPerCorner: number): TPoint[] => {
  const maxRadius = getMaxCornerRadius(rect);
  const smoothing = Math.min(Math.max(rect.cornerSmoothing ?? 0, 0), 1);

  return CORNER_ARCS.flatMap(({ center, entryDir, exitDir, getRadius, startAngle, vertex }) => {
    const radius = Math.min(Math.max(getRadius(rect) ?? rect.cornerRadius, 0), maxRadius);

    if (smoothing > 0 && radius > 0) {
      return getSquircleCornerPoints({ entryDir, exitDir, vertex: vertex(rect) }, radius, smoothing, maxRadius, segmentsPerCorner);
    }

    const { x: centerX, y: centerY } = center(rect, radius);
    return getCircularCornerPoints(centerX, centerY, radius, startAngle, segmentsPerCorner);
  });
};
