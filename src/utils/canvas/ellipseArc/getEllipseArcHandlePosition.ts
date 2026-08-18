// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TEllipseArcFlip } from './types';

// utils
import { flipPoint } from 'utils/math/flipPoint';

export const getEllipseArcHandlePosition = (bounds: TDraftRect, arcEndAngle: number, flip: TEllipseArcFlip = {}, arcRatio = 0): TPoint => {
  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const radiusRatio = arcRatio > 0 ? (arcRatio + 1) / 2 : 1;
  const radiusX = (bounds.width / 2) * radiusRatio;
  const radiusY = (bounds.height / 2) * radiusRatio;
  const mathAngle = ((arcEndAngle - 90) * Math.PI) / 180;
  const localPosition: TPoint = { x: center.x + radiusX * Math.cos(mathAngle), y: center.y + radiusY * Math.sin(mathAngle) };

  return flipPoint(localPosition, center, flip.flipX ?? false, flip.flipY ?? false);
};
