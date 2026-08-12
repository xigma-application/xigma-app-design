// types
import { TDraftRect, TPoint } from 'types/canvas';

export const getEllipsePoints = (rect: TDraftRect, segments: number): TPoint[] => {
  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;
  const radiusX = rect.width / 2;
  const radiusY = rect.height / 2;

  return Array.from({ length: segments }, (_, index) => {
    const angle = (index / segments) * Math.PI * 2;

    return { x: centerX + radiusX * Math.cos(angle), y: centerY + radiusY * Math.sin(angle) };
  });
};
