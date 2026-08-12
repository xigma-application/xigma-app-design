// types
import { TDraftRect, TPoint } from 'types/canvas';

export const isPointInEllipse = (point: TPoint, ellipse: TDraftRect): boolean => {
  const radiusX = ellipse.width / 2;
  const radiusY = ellipse.height / 2;
  const centerX = ellipse.x + radiusX;
  const centerY = ellipse.y + radiusY;
  const normalizedX = (point.x - centerX) / radiusX;
  const normalizedY = (point.y - centerY) / radiusY;

  return normalizedX * normalizedX + normalizedY * normalizedY <= 1;
};
