// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getMaxCornerRadius } from 'utils/canvas/cornerRadius/getMaxCornerRadius';

export type TRoundedRect = TDraftRect & {
  cornerRadius: number;
  cornerRadiusBottomLeft?: number;
  cornerRadiusBottomRight?: number;
  cornerRadiusTopLeft?: number;
  cornerRadiusTopRight?: number;
};

const CORNER_ARCS: {
  center: (rect: TDraftRect, radius: number) => TPoint;
  getRadius: (rect: TRoundedRect) => number | undefined;
  startAngle: number;
}[] = [
  {
    center: (rect, radius) => ({ x: rect.x + radius, y: rect.y + radius }),
    getRadius: (rect) => rect.cornerRadiusTopLeft,
    startAngle: Math.PI,
  },
  {
    center: (rect, radius) => ({ x: rect.x + rect.width - radius, y: rect.y + radius }),
    getRadius: (rect) => rect.cornerRadiusTopRight,
    startAngle: (3 * Math.PI) / 2,
  },
  {
    center: (rect, radius) => ({ x: rect.x + rect.width - radius, y: rect.y + rect.height - radius }),
    getRadius: (rect) => rect.cornerRadiusBottomRight,
    startAngle: 0,
  },
  {
    center: (rect, radius) => ({ x: rect.x + radius, y: rect.y + rect.height - radius }),
    getRadius: (rect) => rect.cornerRadiusBottomLeft,
    startAngle: Math.PI / 2,
  },
];

export const getRoundedRectPoints = (rect: TRoundedRect, segmentsPerCorner: number): TPoint[] => {
  const maxRadius = getMaxCornerRadius(rect);

  return CORNER_ARCS.flatMap(({ center, getRadius, startAngle }) => {
    const radius = Math.min(Math.max(getRadius(rect) ?? rect.cornerRadius, 0), maxRadius);
    const { x: centerX, y: centerY } = center(rect, radius);

    return Array.from({ length: segmentsPerCorner + 1 }, (_, index) => {
      const angle = startAngle + (index / segmentsPerCorner) * (Math.PI / 2);

      return { x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle) };
    });
  });
};
