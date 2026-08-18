// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TEllipseArcFlip } from './types';

// utils
import { flipPoint } from 'utils/math/flipPoint';
import { getEffectiveArcAngles } from './getEffectiveArcAngles';
import { getEllipseArcMajorArc } from './getEllipseArcMajorArc';

export const getEllipseArcRatioHandlePosition = (
  bounds: TDraftRect,
  arcStartAngle: number,
  arcEndAngle: number,
  arcRatio: number,
  flip: TEllipseArcFlip = {},
  arcRatioInverted = false,
): TPoint => {
  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const { effectiveEndAngle, effectiveStartAngle } = getEffectiveArcAngles(arcStartAngle, arcEndAngle, arcRatioInverted);
  const { majorStart, majorSweep } = getEllipseArcMajorArc(effectiveStartAngle, effectiveEndAngle);
  const bisectorAngle = majorStart + majorSweep / 2;
  const radiusX = (bounds.width / 2) * arcRatio;
  const radiusY = (bounds.height / 2) * arcRatio;
  const mathAngle = ((bisectorAngle - 90) * Math.PI) / 180;
  const localPosition: TPoint = { x: center.x + radiusX * Math.cos(mathAngle), y: center.y + radiusY * Math.sin(mathAngle) };

  return flipPoint(localPosition, center, flip.flipX ?? false, flip.flipY ?? false);
};
