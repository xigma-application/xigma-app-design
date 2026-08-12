// types
import { TDraftRect, TPoint } from 'types/canvas';

export const getAspectRatioLockedRect = (start: TPoint, current: TPoint, aspectRatio: number): TDraftRect => {
  const rawWidth = Math.abs(current.x - start.x);
  const rawHeight = Math.abs(current.y - start.y);
  const widthDrivesSize = rawWidth >= aspectRatio * rawHeight;
  const width = widthDrivesSize ? rawWidth : rawHeight * aspectRatio;
  const height = widthDrivesSize ? rawWidth / aspectRatio : rawHeight;

  return {
    height,
    width,
    x: current.x >= start.x ? start.x : start.x - width,
    y: current.y >= start.y ? start.y : start.y - height,
  };
};
