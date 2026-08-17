// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getMaxCornerRadius } from 'utils/canvas/cornerRadius/getMaxCornerRadius';

const isPointInRoundedCorner = (point: TPoint, rect: TDraftRect, cornerRadius: number): boolean => {
  const radius = Math.min(Math.max(cornerRadius, 0), getMaxCornerRadius(rect));
  const cornerCenterX = point.x < rect.x + rect.width / 2 ? rect.x + radius : rect.x + rect.width - radius;
  const cornerCenterY = point.y < rect.y + rect.height / 2 ? rect.y + radius : rect.y + rect.height - radius;
  const isPastCornerX = point.x < rect.x + radius || point.x > rect.x + rect.width - radius;
  const isPastCornerY = point.y < rect.y + radius || point.y > rect.y + rect.height - radius;

  return isPastCornerX && isPastCornerY && Math.hypot(point.x - cornerCenterX, point.y - cornerCenterY) > radius;
};

export const isPointInRect = (point: TPoint, rect: TDraftRect & { cornerRadius?: number }): boolean => {
  const isInBounds = point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
  const cornerRadius = rect.cornerRadius ?? 0;

  return isInBounds && !(cornerRadius > 0 && isPointInRoundedCorner(point, rect, cornerRadius));
};
