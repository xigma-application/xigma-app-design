// types
import { TDraftRect, TPoint } from 'types/canvas';

const unitCircleBySegments = new Map<number, { cos: number[]; sin: number[] }>();

const getUnitCircle = (segments: number): { cos: number[]; sin: number[] } => {
  const cached = unitCircleBySegments.get(segments);

  if (!cached) {
    const angles = Array.from({ length: segments }, (_, index) => (index / segments) * Math.PI * 2);
    const created = { cos: angles.map((angle) => Math.cos(angle)), sin: angles.map((angle) => Math.sin(angle)) };

    unitCircleBySegments.set(segments, created);

    return created;
  }

  return cached;
};

export const getEllipsePoints = (rect: TDraftRect, segments: number): TPoint[] => {
  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;
  const radiusX = rect.width / 2;
  const radiusY = rect.height / 2;
  const { cos, sin } = getUnitCircle(segments);

  return Array.from({ length: segments }, (_, index) => ({ x: centerX + radiusX * cos[index], y: centerY + radiusY * sin[index] }));
};
