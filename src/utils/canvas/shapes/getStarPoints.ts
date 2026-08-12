// types
import { TDraftRect, TPoint } from 'types/canvas';

export const getStarPoints = (rect: TDraftRect, points: number, ratio: number): TPoint[] => {
  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;
  const outerRadiusX = rect.width / 2;
  const outerRadiusY = rect.height / 2;
  const innerRadiusX = outerRadiusX * ratio;
  const innerRadiusY = outerRadiusY * ratio;
  const vertexCount = points * 2;

  return Array.from({ length: vertexCount }, (_, index) => {
    const angle = (index / vertexCount) * Math.PI * 2 - Math.PI / 2;
    const isOuter = index % 2 === 0;
    const radiusX = isOuter ? outerRadiusX : innerRadiusX;
    const radiusY = isOuter ? outerRadiusY : innerRadiusY;

    return { x: centerX + radiusX * Math.cos(angle), y: centerY + radiusY * Math.sin(angle) };
  });
};
