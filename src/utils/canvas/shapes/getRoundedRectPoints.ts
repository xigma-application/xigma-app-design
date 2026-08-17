// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getMaxCornerRadius } from 'utils/canvas/cornerRadius/getMaxCornerRadius';

export type TRoundedRect = TDraftRect & { cornerRadius: number };

const CORNER_ARCS: { center: (rect: TDraftRect, radius: number) => TPoint; startAngle: number }[] = [
  { center: (rect, radius) => ({ x: rect.x + radius, y: rect.y + radius }), startAngle: Math.PI },
  { center: (rect, radius) => ({ x: rect.x + rect.width - radius, y: rect.y + radius }), startAngle: (3 * Math.PI) / 2 },
  { center: (rect, radius) => ({ x: rect.x + rect.width - radius, y: rect.y + rect.height - radius }), startAngle: 0 },
  { center: (rect, radius) => ({ x: rect.x + radius, y: rect.y + rect.height - radius }), startAngle: Math.PI / 2 },
];

export const getRoundedRectPoints = (rect: TRoundedRect, segmentsPerCorner: number): TPoint[] => {
  const radius = Math.min(Math.max(rect.cornerRadius, 0), getMaxCornerRadius(rect));

  return CORNER_ARCS.flatMap(({ center, startAngle }) => {
    const { x: centerX, y: centerY } = center(rect, radius);

    return Array.from({ length: segmentsPerCorner + 1 }, (_, index) => {
      const angle = startAngle + (index / segmentsPerCorner) * (Math.PI / 2);

      return { x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle) };
    });
  });
};
